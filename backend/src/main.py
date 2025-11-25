from typing import Union
from fastapi import FastAPI

# ❌ ANTES: from .config import create_tables
# ✅ DESPUÉS: Importaciones absolutas
from src.config import create_tables
from src.auth.routes import users_routers, auth_routers
from src.core.routes.routes import core_routers
from src.core.routes.stripe_routes import webhook_router
from src.config import MEDIA_ROOT, origins

from fastapi.openapi.utils import get_openapi
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title='E-commerce API')

# add routes
app.include_router(users_routers)
app.include_router(auth_routers)
app.include_router(core_routers)
app.include_router(webhook_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# add static url
app.mount("/media", StaticFiles(directory=MEDIA_ROOT), name="media")

# custom configuration OpenAPI
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    
    openapi_schema = get_openapi(
        title="E-commerce API",
        version="1.0.0",
        routes=app.routes,
    )
    
    if "components" in openapi_schema and "securitySchemes" in openapi_schema["components"]:
        openapi_schema["components"]["securitySchemes"] = {
            "BearerAuth": {
                "type": "http",
                "scheme": "bearer",
                "bearerFormat": "JWT",
                "description": "Ingresa tu token JWT. Obténlo desde /auth/login"
            }
        }
    
    for path, methods in openapi_schema.get("paths", {}).items():
        for method, details in methods.items():
            if "security" in details:
                details["security"] = [{"BearerAuth": []}]
    
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi

# create tables
@app.on_event("startup")
async def on_startup():
    await create_tables()