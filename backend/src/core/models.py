from datetime import datetime
from zoneinfo import ZoneInfo
from sqlalchemy import Enum as SQLAlchemyEnum
from .enums import OrderStatus,PaymentMethod
from ..auth.models import Base
from sqlalchemy import Integer, ForeignKey
from sqlalchemy.orm import mapped_column,Mapped
from typing import Optional
from sqlalchemy.orm import relationship
from typing import List
from decimal import Decimal
from sqlalchemy import Numeric

class Product(Base):
    __tablename__ = "product"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(index=True)
    description: Mapped[str] 
    price: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),  # 10 dígitos totales, 2 decimales
        index=True
    )
    is_active: Mapped[bool] = mapped_column(default=True)
    category: Mapped[str] = mapped_column(index=True)
    image_url: Mapped[Optional[str]]
    created_at: Mapped[datetime] = mapped_column(default=datetime.now(ZoneInfo("America/Havana")))

class Order(Base):
    __tablename__ = "order"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    customer_id: Mapped[int] = mapped_column(ForeignKey("user.id", ondelete="CASCADE"))
    order_date: Mapped[datetime] = mapped_column(default=datetime.now(ZoneInfo("America/Havana")))
    total_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    status: Mapped[OrderStatus] = mapped_column(SQLAlchemyEnum(OrderStatus),default=OrderStatus.PENDING)
    payment_method: Mapped[PaymentMethod] = mapped_column(SQLAlchemyEnum(PaymentMethod))
    shipping_address: Mapped[str]
    items: Mapped[List["OrderItem"]] = relationship(back_populates="order")

class OrderItem(Base):
    __tablename__ = "order_item"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("order.id", ondelete="CASCADE"))
    product_id: Mapped[int] = mapped_column(ForeignKey("product.id",ondelete="CASCADE"))
    quantity: Mapped[int]
    unit_price: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    subtotal: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    created_at: Mapped[datetime] = mapped_column(default=datetime.now(ZoneInfo("America/Havana")))
    order: Mapped["Order"] = relationship(back_populates="items")
    
    def calculate_subtotal(self):
        self.subtotal = round(self.unit_price * self.quantity, 2)