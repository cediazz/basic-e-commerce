from fastapi import APIRouter, HTTPException, status, Depends, File, UploadFile,Query,Request
from fastapi import Form
from ..schemas.product_schemas import ProductListSchema
from sqlalchemy.ext.asyncio import AsyncSession
from ...config import get_async_session
from uuid import uuid4
from ...config import PRODUCT_IMAGES_DIR
import shutil
import os
from ..models import Product
from ...config import HOST
from sqlalchemy import select,func
from ..paginator import paginate,PaginatedResponse
from typing import Optional

product_routers = APIRouter(
    prefix="/products",
    tags=["product"],
)

@product_routers.post("/",response_model=ProductListSchema, status_code=status.HTTP_201_CREATED)
async def create_product(
    name: str = Form(...),
    description: str = Form(...),
    price: float = Form(..., ge=0),
    category: str = Form(...),
    is_active: bool = Form(default=True),
    image: UploadFile = File(),
    session: AsyncSession = Depends(get_async_session)
):
    # image validation
    if not image.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El archivo debe ser una imagen válida"
        )
    
    try:
        #save image
        file_extension = image.filename.split(".")[-1].lower()
        filename = f"{uuid4()}.{file_extension}"
        file_path = PRODUCT_IMAGES_DIR / filename
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        
        image_url = f"{HOST}/media/products/{filename}"
        
        # save product
        product = Product(
            name=name,
            description=description,
            price=price,
            category=category,
            is_active=is_active,
            image_url=image_url
        )
        
        session.add(product)
        await session.commit()
        await session.refresh(product)
        
        return product
        
    except Exception as e:
        # Si hay error, eliminar la imagen guardada
        if 'file_path' in locals() and os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al crear el producto: {str(e)}"
        )
        
@product_routers.get("/", response_model=PaginatedResponse, status_code=status.HTTP_200_OK)
async def list_product(
    request: Request,
    session: AsyncSession = Depends(get_async_session),
    category: Optional[str] = Query(None, description="Filtrar productos por categoría"),
    offset: int = Query(0, ge=0, description="Índice inicial desde el que se devolverán los resultados."),
    limit: int = Query(20, ge=1, le=30, description="Límite de registros por página."),
):
    try:
        query = select(Product).order_by(Product.created_at.desc())
        
        if category:
            query = query.where(Product.category == category)
        
        base_query = query
        
        query = query.offset(offset).limit(limit)
        
        products_result = await session.execute(query)
        products = products_result.scalars().all()
        return await paginate(request,offset,limit,Product,base_query,products,session,ProductListSchema)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener productos: {str(e)}"
        )

@product_routers.get("/categorys", response_model=list[str], status_code=status.HTTP_200_OK)
async def get_categorys(
    session: AsyncSession = Depends(get_async_session)
):
    try:
        # Consulta para obtener categorías únicas
        query = select(Product.category).distinct().order_by(func.lower(Product.category))
        results = await session.execute(query)
        categories = results.scalars().all()
        return categories
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener categorías: {str(e)}"
        )


@product_routers.get("/{product_id}", response_model=ProductListSchema, status_code=status.HTTP_200_OK)
async def get_product(
    product_id: int,
    session: AsyncSession = Depends(get_async_session)
):
    product = await session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="No se encontró un producto para el id solicitado")
    return product


@product_routers.patch("/{product_id}",response_model=ProductListSchema, status_code=status.HTTP_200_OK)
async def update_product(
    product_id: int,
    name: str = Form(...),
    description: str = Form(...),
    price: float = Form(..., ge=0),
    category: str = Form(...),
    is_active: bool = Form(default=True),
    image: UploadFile = File(),
    session: AsyncSession = Depends(get_async_session)
):
    product = await session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="No se encontró un producto para el id solicitado")
    
    # image validation
    if not image.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El archivo debe ser una imagen válida"
        )
    
    try:
        #save image
        file_extension = image.filename.split(".")[-1].lower()
        filename = f"{uuid4()}.{file_extension}"
        file_path = PRODUCT_IMAGES_DIR / filename
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        
        image_url = f"{HOST}/media/products/{filename}"
        
        # update product
        product.name = name
        product.description = description
        product.price = price
        product.category = category
        product.is_active = is_active
        product.image_url = image_url
        await session.commit()
        await session.refresh(product)
        
        return product
    
    except Exception as e:
        # Si hay error, eliminar la imagen guardada
        if 'file_path' in locals() and os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar el producto: {str(e)}"
        )

@product_routers.delete("/{product_id}",status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: int,
    session: AsyncSession = Depends(get_async_session)
):
    product = await session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="No se encontró un producto para el id solicitado")
    await session.delete(product)
    await session.commit()
    return {"ok": True}