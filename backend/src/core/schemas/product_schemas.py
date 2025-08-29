from pydantic import BaseModel
from datetime import datetime
from decimal import Decimal
from pydantic import Field

class ProductListSchema(BaseModel):
    id: int
    name: str
    description:str
    price: Decimal = Field(ge=0, max_digits=10, decimal_places=2)
    is_active: bool
    category: str
    image_url: str
    created_at: datetime
    class Config:
        from_attributes = True