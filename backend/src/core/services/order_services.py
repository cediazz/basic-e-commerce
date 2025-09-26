from ..schemas.order_schemas import OrderCreateSchema, OrderListSchema,OrderUpdateSchema, OrderListBasicSchema
from sqlalchemy.ext.asyncio import AsyncSession
from ..dependencies import get_user_by_id, get_product_by_id
from ..models import Order, OrderItem
from fastapi import Request, HTTPException, status
from sqlalchemy import select
from ..paginator import paginate
from sqlalchemy.orm import selectinload
from ..enums import PaymentMethod
from typing import Optional

class OrderService:

    async def create_order(self, order_data: OrderCreateSchema, session: AsyncSession):
        customer = await get_user_by_id(order_data.customer_id, session)

        data_as_dict = order_data.model_dump(exclude_unset=True)
        items_data = data_as_dict.pop('items', [])

        # create Order
        order = Order(**data_as_dict)

        # Crear y asignar OrderItems usando la relación
        for item_data in items_data:
            await get_product_by_id(item_data['product_id'], session)
            # Crear OrderItem y asignar a la relación
            order_item = OrderItem(
                product_id=item_data['product_id'],
                quantity=item_data['quantity'],
                unit_price=item_data['unit_price'],
                subtotal=item_data['quantity'] * item_data['unit_price']
            )
            order.items.append(order_item)

        # Agregar order (los items se agregarán en cascada)
        session.add(order)
        await session.commit()
        await session.refresh(order, ['items'])
        return order

    async def list_order(
        self, 
        request: Request, 
        session: AsyncSession, 
        offset: int, 
        limit: int, 
        user_id: Optional[int]=None
    ):
        try:
            query = select(Order).order_by(Order.order_date.desc())
            
            if user_id:
                query = query.where(Order.customer_id == user_id)
            
            base_query = query
        
            query = query.offset(offset).limit(limit)
            orders_result = await session.execute(query)
            orders = orders_result.scalars().all()
            return await paginate(request, offset, limit, Order, base_query ,orders, session, OrderListBasicSchema)

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error al obtener productos: {str(e)}"
            )

    async def get_order(self, order_id: int, session: AsyncSession):
        query = (
            select(Order)
            .options(
                selectinload(Order.items)
               .selectinload(OrderItem.product)
            )
            .where(Order.id == order_id)
        )
        result = await session.scalars(query)
        order = result.first()
        if not order:
            raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No se encontró la orden para el id solicitado"
            )
        return order
    
    async def update_order(self, order_id: int, order_data: OrderUpdateSchema, session: AsyncSession):
        order = await self.get_order(order_id,session)#session.get(Order, order_id)
        
        await get_user_by_id(order_data.customer_id, session)
        
        order.customer_id = order_data.customer_id
        order.total_amount = order_data.total_amount
        order.status = order_data.status
        order.payment_method = order_data.payment_method
        order.shipping_address = order_data.shipping_address
        await session.commit()
        await session.refresh(order)
        return order
    
    async def delete_order(self, order_id: int, session: AsyncSession):
        order = await session.get(Order, order_id)
        if not order:
            raise HTTPException(status_code=404, detail="No se encontró la orden para el id solicitado")
        await session.delete(order)
        await session.commit()
        return {"ok": True}
    
    def get_payment_methods(self):
        payment_methods = [method.value for method in PaymentMethod]
        return payment_methods