from fastapi_users import FastAPIUsers
from .models import User
from .user_manager import get_user_manager
from .auth_backend import auth_backend
from fastapi import APIRouter
from .schemas import UserCreate, UserRead, UserUpdate

users_router = APIRouter()

fastapi_users = FastAPIUsers[User, int](
    get_user_manager,
    [auth_backend],
)

#registrar las rutas para GET,PATCH y DELETE
users_router.include_router(fastapi_users.get_users_router(UserRead, UserUpdate))
#registrar las rutas para POST
users_router.include_router(fastapi_users.get_register_router(UserRead,UserCreate))
#registrar las rutas para auntenticarse
users_router.include_router(fastapi_users.get_auth_router(auth_backend))