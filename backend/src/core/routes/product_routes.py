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
from sqlalchemy import select
from ..paginator import paginate,PaginatedResponse
from ...auth.routes import fastapi_users

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
    offset: int = Query(0, ge=0, description="Índice inicial desde el que se devolverán los resultados."),
    limit: int = Query(20, ge=1, le=30, description="Límite de registros por página."),
):
    try:
        products_result = await session.execute(
            select(Product)
            .order_by(Product.created_at.desc())
            .offset(offset)
            .limit(limit)
        )
        products = products_result.scalars().all()
        return await paginate(request,offset,limit,Product,products,session,ProductListSchema)
        
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener productos: {str(e)}"
        )