from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..auth.models import User
from .models import Product
from fastapi import HTTPException,status

async def get_user_by_id(user_id:int, session:AsyncSession):
    customer_result = await session.execute(
        select(User).where(User.id == user_id)
    )
    customer = customer_result.scalar_one_or_none()
    
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No se encontró al usuario con id {user_id}"
        )
    return customer

async def get_product_by_id(product_id:int, session:AsyncSession):
    product_result = await session.execute(
            select(Product).where(Product.id == product_id)
    )
    product = product_result.scalar_one_or_none()
        
    if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Producto con id {product_id} no encontrado"
            )
    return product