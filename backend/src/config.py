from collections.abc import AsyncGenerator
from fastapi import Depends
from fastapi_users.db import SQLAlchemyUserDatabase
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from .auth.models import Base,User
import os
from decouple import config
from pathlib import Path

#***SECRET_KEY***
SECRET = os.environ.get('SECRET_KEY', config('SECRET_KEY'))
STRIPE_SECRET_KEY = config('STRIPE_SECRET_KEY')
STRIPE_WEBHOOK_SECRET = config('STRIPE_WEBHOOK_SECRET')
STRIPE_PUBLISHABLE_KEY = config('STRIPE_PUBLISHABLE_KEY')
# Webhook secret diferente para desarrollo/producción
if config('ENVIRONMENT', default='development') == 'production':
    STRIPE_WEBHOOK_SECRET = config('STRIPE_WEBHOOK_SECRET')
else:
    # Para desarrollo con Stripe CLI
    STRIPE_WEBHOOK_SECRET = config('STRIPE_WEBHOOK_SECRET_DEV', default='whsec_test')

#***host configuration***
HOST = f"https://{os.environ.get('RENDER_EXTERNAL_HOSTNAME', '')}" if os.environ.get('RENDER_EXTERNAL_HOSTNAME') else 'http://127.0.0.1:8000'

#***CORS***
origins = [
    config('FRONTEND_HOST'),
    "http://127.0.0.1:3000",
    "http://localhost:3000",
]

#***Database configurations***
DATABASE_URL = 'sqlite+aiosqlite:///./db.sqlite3'

engine = create_async_engine(DATABASE_URL,connect_args={"check_same_thread": False})
async_session_maker = async_sessionmaker(engine, expire_on_commit=False)


async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        yield session


async def get_user_db(session: AsyncSession = Depends(get_async_session)):
    yield SQLAlchemyUserDatabase(session, User)



#***static files configurations***
BASE_DIR = Path(__file__).resolve().parent
MEDIA_ROOT = BASE_DIR / "media"
PRODUCT_IMAGES_DIR = MEDIA_ROOT / "products"
# create products images directory
PRODUCT_IMAGES_DIR.mkdir(parents=True, exist_ok=True)