"""
 La clase UserManager es la lógica central de FastAPI Users. Ofrecemos la clase 
 BaseUserManager, que puede extender para configurar parámetros y definir la lógica, 
 por ejemplo, cuando un usuario se acaba de registrar o ha olvidado su contraseña.
Está diseñada para ser fácilmente extensible y personalizable, de modo que pueda 
integrar su propia lógica.
"""
import uuid
from typing import Optional

from fastapi import Depends, Request
from fastapi_users import BaseUserManager, UUIDIDMixin
from .models import User
from .config import get_user_db

SECRET = "SECRET"


class UserManager(UUIDIDMixin, BaseUserManager[User, int]):
    reset_password_token_secret = SECRET
    verification_token_secret = SECRET

    async def on_after_register(self, user: User, request: Optional[Request] = None):
        print(f"User {user.id} has registered.")

    async def on_after_forgot_password(
        self, user: User, token: str, request: Optional[Request] = None
    ):
        print(f"User {user.id} has forgot their password. Reset token: {token}")

    async def on_after_request_verify(
        self, user: User, token: str, request: Optional[Request] = None
    ):
        print(f"Verification requested for user {user.id}. Verification token: {token}")


async def get_user_manager(user_db=Depends(get_user_db)):
    yield UserManager(user_db)