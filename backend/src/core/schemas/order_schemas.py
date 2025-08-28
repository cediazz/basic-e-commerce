from pydantic import BaseModel
from datetime import datetime
from ..enums import OrderStatus,PaymentMethod

class OrderCreateSchema(BaseModel):
    customer_id: int
    total_amount: float
    status: OrderStatus
    payment_method: PaymentMethod
    shipping_address: str
    
class OrderListSchema(OrderCreateSchema):
    id: int
    order_date: datetime
    class Config:
        from_attributes = True