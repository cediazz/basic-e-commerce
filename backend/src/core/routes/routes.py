from fastapi import APIRouter, Depends
from ...auth.routes import fastapi_users
from .product_routes import product_routers

core_routers = APIRouter(
    dependencies = [
        Depends(fastapi_users.authenticator.current_user_token(active=True, verified=False))
        ],
)
core_routers.include_router(product_routers)
