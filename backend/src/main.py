from typing import Union
from fastapi import FastAPI
from .auth.config import create_auth_tables
from .auth.routes import users_routers,auth_routers

app = FastAPI(title='E-commerce API')

app.include_router(users_routers)
app.include_router(auth_routers)

@app.on_event("startup")
async def on_startup():
    await create_auth_tables()



@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}