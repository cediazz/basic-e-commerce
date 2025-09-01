from fastapi import APIRouter, HTTPException, status, Depends,Query,Request
from fastapi import Form
from ..schemas.order_schemas import OrderCreateSchema,OrderListSchema,OrderUpdateSchema
from sqlalchemy.ext.asyncio import AsyncSession
from ...config import get_async_session
from ..models import Order
from ...config import HOST
from sqlalchemy import select
from ..paginator import paginate,PaginatedResponse
from typing import Annotated
from ...auth.models import User
from ..services.order_services import OrderService

order_routers = APIRouter(
    prefix="/orders",
    tags=["order"],
)

@order_routers.post("/",response_model=OrderListSchema, status_code=status.HTTP_201_CREATED)
async def create_order(
    order_data: OrderCreateSchema,
    session: AsyncSession = Depends(get_async_session)
):
    return await OrderService().create_order(order_data,session)
        

@order_routers.get("/", response_model=PaginatedResponse, status_code=status.HTTP_200_OK)
async def list_order(
    request: Request,
    session: AsyncSession = Depends(get_async_session),
    offset: int = Query(0, ge=0, description="Índice inicial desde el que se devolverán los resultados."),
    limit: int = Query(20, ge=1, le=30, description="Límite de registros por página."),
):
    return await OrderService().list_order(request,session,offset,limit)

@order_routers.get("/{order_id}", response_model=OrderListSchema, status_code=status.HTTP_200_OK)
async def get_order(
    order_id: int,
    session: AsyncSession = Depends(get_async_session)
):
    return await OrderService().get_order(order_id,session)


@order_routers.patch("/{order_id}",response_model=OrderListSchema, status_code=status.HTTP_200_OK)
async def update_order(
    order_id: int,
    order_data: OrderUpdateSchema,
    session: AsyncSession = Depends(get_async_session)
):
    return await OrderService().update_order(order_id,order_data,session)

@order_routers.delete("/{order_id}",status_code=status.HTTP_204_NO_CONTENT)
async def delete_order(
    order_id: int,
    session: AsyncSession = Depends(get_async_session)
):
    return await OrderService().delete_order(order_id,session)