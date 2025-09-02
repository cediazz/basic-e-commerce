from fastapi_users.authentication import BearerTransport
from .models import User
from fastapi import Response
import json

class CustomBearerTransport(BearerTransport):
    
    #overwrite
    async def get_login_response(self, token: str, user: User) -> Response:
        # Crear respuesta personalizada
        response_data = {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "email": user.email,
                "fullname": user.fullname,
                "username": getattr(user, 'username', None),
            }
        }
        
        return Response(
            content=json.dumps(response_data),
            media_type="application/json",
            status_code=200,
        )