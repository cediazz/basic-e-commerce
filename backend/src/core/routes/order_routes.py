from fastapi import APIRouter, status, Depends,Query,Request
from ..schemas.order_schemas import OrderCreateSchema,OrderListSchema,OrderUpdateSchema
from sqlalchemy.ext.asyncio import AsyncSession
from ...config import get_async_session
from ..paginator import PaginatedResponse
from ..services.order_services import OrderService

order_routers = APIRouter(
    prefix="/orders",
    tags=["order"],
)

@order_routers.post("/",response_model=OrderCreateSchema, status_code=status.HTTP_201_CREATED)
async def create_order(
    order_data: OrderCreateSchema,
    session: AsyncSession = Depends(get_async_session),
    order_service: OrderService = Depends(OrderService)
):
    return await order_service.create_order(order_data,session)
        

@order_routers.get("/", response_model=PaginatedResponse, status_code=status.HTTP_200_OK)
async def list_order(
    request: Request,
    session: AsyncSession = Depends(get_async_session),
    offset: int = Query(0, ge=0, description="Índice inicial desde el que se devolverán los resultados."),
    limit: int = Query(20, ge=1, le=30, description="Límite de registros por página."),
    order_service: OrderService = Depends(OrderService)
):
    return await order_service.list_order(request,session,offset,limit)

@order_routers.get("/payment_methods", status_code=status.HTTP_200_OK)
async def list_payment_methods(order_service: OrderService = Depends(OrderService)):
    return order_service.get_payment_methods()

@order_routers.get("/{order_id}", response_model=OrderListSchema, status_code=status.HTTP_200_OK)
async def get_order(
    order_id: int,
    session: AsyncSession = Depends(get_async_session),
    order_service: OrderService = Depends(OrderService)
):
    return await order_service.get_order(order_id,session)


@order_routers.patch("/{order_id}",response_model=OrderListSchema, status_code=status.HTTP_200_OK)
async def update_order(
    order_id: int,
    order_data: OrderUpdateSchema,
    session: AsyncSession = Depends(get_async_session),
    order_service: OrderService = Depends(OrderService)
):
    return await order_service.update_order(order_id,order_data,session)

@order_routers.delete("/{order_id}",status_code=status.HTTP_204_NO_CONTENT)
async def delete_order(
    order_id: int,
    session: AsyncSession = Depends(get_async_session),
    order_service: OrderService = Depends(OrderService)
):
    return await order_service.delete_order(order_id,session)