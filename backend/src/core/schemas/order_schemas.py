from pydantic import BaseModel
from datetime import datetime
from ..enums import OrderStatus,PaymentMethod
from typing import List
from decimal import Decimal
from pydantic import Field
from.product_schemas import ProductListSchema

class OrderItemCreateSchema(BaseModel):
    product_id: int 
    quantity: int
    unit_price:Decimal = Field(ge=0, max_digits=10, decimal_places=2)

class OrderItemListSchema(BaseModel):
    id: int
    quantity: int
    unit_price:Decimal = Field(ge=0, max_digits=10, decimal_places=2)
    subtotal:Decimal = Field(ge=0, max_digits=12, decimal_places=2)
    created_at: datetime
    product: ProductListSchema
    class Config:
        from_attributes = True

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

class OrderUpdateSchema(BaseModel):
    customer_id: int
    total_amount:Decimal = Field(ge=0, max_digits=12, decimal_places=2)
    status: OrderStatus
    payment_method: PaymentMethod
    shipping_address: str