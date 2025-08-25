from fastapi_users import FastAPIUsers
from .models import User
from .user_manager import get_user_manager
from .auth_backend import auth_backend
from fastapi import APIRouter
from .schemas import UserCreate, UserRead, UserUpdate
from fastapi import Depends
from fastapi_users.authentication import Strategy
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi_users.router.common import ErrorCode
from typing import Annotated
from fastapi import Form
from .user_manager import UserManager
from fastapi import Request
from pydantic import EmailStr
from fastapi_users.authentication import Authenticator

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

#users CRUD routes
users_routers.include_router(fastapi_users.get_users_router(UserRead, UserUpdate))

#users create routes
users_routers.include_router(fastapi_users.get_register_router(UserRead,UserCreate))

#auth routes
@auth_routers.post(
        "/login",
        name=f"auth:{auth_backend.name}.login",
)
async def login(
        request: Request,
        email: Annotated[EmailStr, Form()], password: Annotated[str, Form()],
        #credentials: OAuth2PasswordRequestForm = Depends(),
        user_manager: UserManager = Depends(get_user_manager),
        strategy: Strategy = Depends(auth_backend.get_strategy),
    ):
        credentials = {"email": email, "password": password}
        user = await user_manager.authenticate(credentials)

        if user is None or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=ErrorCode.LOGIN_BAD_CREDENTIALS,
            )
        response = await auth_backend.login(strategy, user)
        await user_manager.on_after_login(user, request, response)
        return response

@auth_routers.post(
        "/logout", 
        name=f"auth:{auth_backend.name}.logout"
)
async def logout(
        user_token: tuple = Depends(fastapi_users.authenticator.current_user_token(active=True, verified=False)),
        strategy: Strategy = Depends(auth_backend.get_strategy),
    ):
        user, token = user_token
        return await auth_backend.logout(strategy, user, token) # implementar, no hace nada