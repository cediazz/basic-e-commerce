from datetime import datetime
from zoneinfo import ZoneInfo
from sqlalchemy import Enum as SQLAlchemyEnum
from .enums import OrderStatus,PaymentMethod
from ..auth.models import Base
from sqlalchemy import Integer, ForeignKey
from sqlalchemy.orm import mapped_column,Mapped
from typing import Optional

class Product(Base):
    __tablename__ = "product"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(index=True)
    description: Mapped[str] 
    price: Mapped[float] = mapped_column(index=True)
    is_active: Mapped[bool] = mapped_column(default=True)
    category: Mapped[str] = mapped_column(index=True)
    image_url: Mapped[Optional[str]]
    created_at: Mapped[datetime] = mapped_column(default=datetime.now(ZoneInfo("America/Havana")))

class Order(Base):
    __tablename__ = "order"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    customer_id: Mapped[int] = mapped_column(ForeignKey("user.id"))
    order_date: Mapped[datetime] = mapped_column(default=datetime.now(ZoneInfo("America/Havana")))
    total_amount: Mapped[float]
    status: Mapped[OrderStatus] = mapped_column(SQLAlchemyEnum(OrderStatus),default=OrderStatus.PENDING)
    payment_method: Mapped[PaymentMethod] = mapped_column(SQLAlchemyEnum(PaymentMethod))
    shipping_address: Mapped[str]

class OrderItem(Base):
    __tablename__ = "order_item"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("order.id"))
    product_id: Mapped[int] = mapped_column(ForeignKey("product.id"))
    quantity: Mapped[int]
    unit_price: Mapped[float] #current price of the product
    subtotal: Mapped[float] # unit_price * quantity
    created_at: Mapped[datetime] = mapped_column(default=datetime.now(ZoneInfo("America/Havana")))
    
    def calculate_subtotal(self):
        self.subtotal = round(self.unit_price * self.quantity, 2)