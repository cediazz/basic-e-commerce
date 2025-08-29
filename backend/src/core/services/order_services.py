from ..schemas.order_schemas import OrderCreateSchema,OrderListSchema
from sqlalchemy.ext.asyncio import AsyncSession
from ..dependencies import get_user_by_id,get_product_by_id
from ..models import Order,OrderItem

class OrderService:
    
    async def create_order(self, order_data: OrderCreateSchema,session:AsyncSession):
        customer = await get_user_by_id(order_data.customer_id,session)
        
        data_as_dict = order_data.model_dump(exclude_unset=True)
        items_data = data_as_dict.pop('items', [])
        
        #create Order
        order = Order(**data_as_dict)
        
        # Crear y asignar OrderItems usando la relación
        for item_data in items_data:
            await get_product_by_id(item_data['product_id'],session)
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