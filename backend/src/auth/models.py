from fastapi_users.db import SQLAlchemyBaseUserTable
from sqlalchemy.orm import DeclarativeBase,mapped_column,Mapped
from sqlalchemy import Integer,String

class Base(DeclarativeBase):
    pass


class User(SQLAlchemyBaseUserTable, Base):
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    username: Mapped[str] = mapped_column(String(30), index=True)
    fullname: Mapped[str] = mapped_column(String(256))