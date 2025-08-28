from pydantic import BaseModel
from datetime import datetime


class ProductListSchema(BaseModel):
    id: int
    name: str
    description:str
    price: float
    is_active: bool
    category: str
    image_url: str
    created_at: datetime
    class Config:
        from_attributes = True