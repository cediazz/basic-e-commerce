from pydantic import BaseModel
from datetime import datetime

class BaseSchema(BaseModel):
    class Config:
        from_attributes = True


class ProductListSchema(BaseSchema):
    id: int
    name: str
    description:str
    price: float
    is_active: bool
    category: str
    image_url: str
    created_at: datetime