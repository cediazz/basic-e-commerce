from typing import Union
from fastapi import FastAPI
from .auth.config import create_auth_tables

app = FastAPI(title='E-commerce API')

@app.on_event("startup")
async def on_startup():
    await create_auth_tables()



@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}