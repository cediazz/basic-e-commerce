"""
 La clase UserManager es la lógica central de FastAPI Users. Ofrecemos la clase 
 BaseUserManager, que puede extender para configurar parámetros y definir la lógica, 
 por ejemplo, cuando un usuario se acaba de registrar o ha olvidado su contraseña.
Está diseñada para ser fácilmente extensible y personalizable, de modo que pueda 
integrar su propia lógica.
"""
from typing import Optional
from fastapi import Depends, Request, Response
from fastapi_users import BaseUserManager, IntegerIDMixin
from .models import User
from .config import get_user_db
from ..config import SECRET
from fastapi_users import exceptions

class UserManager(IntegerIDMixin, BaseUserManager[User, int]):
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
    
    async def on_after_login(self, user: User, request: Request | None = None, response: Response | None = None) -> None:
        print(f"Authenticated user: {user.fullname}")
    
    async def authenticate(
        self, credentials: dict
    ) -> Optional[User]:
        """
        Authenticate and return a user following an email and a password.

        Will automatically upgrade password hash if necessary.

        :param credentials: The user credentials.
        """
        try:
            user = await self.get_by_email(credentials["email"])
        except exceptions.UserNotExists:
            # Run the hasher to mitigate timing attack
            # Inspired from Django: https://code.djangoproject.com/ticket/20760
            self.password_helper.hash(credentials["password"])
            return None

        verified, updated_password_hash = self.password_helper.verify_and_update(
            credentials["password"], user.hashed_password
        )
        if not verified:
            return None
        # Update password hash to a more robust one if needed
        if updated_password_hash is not None:
            await self.user_db.update(user, {"hashed_password": updated_password_hash})

        return user


async def get_user_manager(user_db=Depends(get_user_db)):
    yield UserManager(user_db)