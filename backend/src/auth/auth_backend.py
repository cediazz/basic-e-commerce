from fastapi_users.authentication import AuthenticationBackend, BearerTransport, JWTStrategy
from ..config import SECRET
from .transport import CustomBearerTransport
from.models import User
from fastapi_users.authentication.strategy import Strategy
from fastapi import Response

bearer_transport = CustomBearerTransport(tokenUrl="auth/login")

def get_jwt_strategy() -> JWTStrategy:
    return JWTStrategy(secret=SECRET, lifetime_seconds=28800)

class CustomAuthBackend(AuthenticationBackend):
    
    #overwrite
    async def login(self, strategy: Strategy, user: User) -> Response:
        token = await strategy.write_token(user)
        return await self.transport.get_login_response(token, user)

auth_backend = CustomAuthBackend(
    name="jwt",
    transport=bearer_transport,
    get_strategy=get_jwt_strategy,
)