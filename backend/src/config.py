#Database configurations
DATABASE_URL = "sqlite+aiosqlite:///./db.sqlite3"

#SECRET_KEY
import os
from decouple import config

SECRET = os.environ.get('SECRET_KEY', config('SECRET_KEY'))