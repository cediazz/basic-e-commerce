from pydantic import BaseModel
from datetime import datetime
from ..enums import OrderStatus,PaymentMethod
from typing import List
from decimal import Decimal
from pydantic import Field


class OrderItemCreateSchema(BaseModel):
    product_id: int 
    quantity: int
    unit_price:Decimal = Field(ge=0, max_digits=10, decimal_places=2)

class OrderItemListSchema(OrderItemCreateSchema):
    subtotal:Decimal = Field(ge=0, max_digits=12, decimal_places=2)
    id: int
    product_id: int
    created_at: datetime

class OrderCreateSchema(BaseModel):
    customer_id: int
    total_amount:Decimal = Field(ge=0, max_digits=12, decimal_places=2)
    status: OrderStatus
    payment_method: PaymentMethod
    shipping_address: str
    items: List[OrderItemCreateSchema]
    
class OrderListSchema(OrderCreateSchema):
    id: int
    order_date: datetime
    items: List[OrderItemListSchema]
    class Config:
        from_attributes = True