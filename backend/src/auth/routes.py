from fastapi_users import FastAPIUsers
from .models import User
from .user_manager import get_user_manager
from .auth_backend import auth_backend
from fastapi import APIRouter
from .schemas import UserCreate, UserRead, UserUpdate
from .user_manager import LoginRequest
from fastapi import Depends
from fastapi_users.authentication import Authenticator
from fastapi_users.manager import BaseUserManager, UserManagerDependency
from fastapi_users.authentication import Strategy
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi_users.router.common import ErrorCode, ErrorModel

users_routers = APIRouter(
    prefix="/users",
    tags=["users"],
)
auth_routers = APIRouter(
    prefix="/auth",
    tags=["auth"],
)

fastapi_users = FastAPIUsers[User, int](
    get_user_manager,
    [auth_backend],
)

#registrar las rutas para GET,PATCH y DELETE
users_routers.include_router(fastapi_users.get_users_router(UserRead, UserUpdate))
#registrar las rutas para POST
users_routers.include_router(fastapi_users.get_register_router(UserRead,UserCreate))
#registrar las rutas para auntenticarse
#auth_routers.include_router(fastapi_users.get_auth_router(auth_backend))



@auth_routers.post(
        "/login",
        name=f"auth:{auth_backend.name}.login",
        #responses=login_responses,
)
async def login(
        request: LoginRequest,
        #credentials: OAuth2PasswordRequestForm = Depends(),
        user_manager: BaseUserManager = Depends(get_user_manager),
        strategy: Strategy = Depends(auth_backend.get_strategy),
    ):
        user = await user_manager.authenticate(request)

        if user is None or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=ErrorCode.LOGIN_BAD_CREDENTIALS,
            )
        response = await auth_backend.login(strategy, user)
        #await user_manager.on_after_login(user, request, response)
        return response