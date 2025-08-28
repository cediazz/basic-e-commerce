from pydantic import BaseModel
from typing import Generic, TypeVar, Optional
from fastapi import Request
from urllib.parse import urlencode
from sqlalchemy.ext.asyncio import AsyncSession
from ..auth.models import Base
from sqlalchemy import select,func
from typing import Sequence
from .schemas.product_schemas import BaseSchema

T = TypeVar('T')

class PaginatedResponse(BaseModel, Generic[T]):
    count: int
    next: Optional[str] = None
    previous: Optional[str] = None
    results: Sequence[T]

    class Config:
        arbitrary_types_allowed = True


async def paginate(
    request: Request,
    offset: int,
    limit: int,
    model: Base,
    results: Sequence[T],
    session: AsyncSession,
    response_schema: BaseSchema
) -> PaginatedResponse[BaseSchema]:
    """Genera los enlaces next y previous al estilo Django"""
    #base_url = str(request.url)
    #print(base_url)
    #Obtener el conteo total
    total_count_result = await session.execute(select(func.count(model.id)))
    total_count = total_count_result.scalar()
    
    # Determinar si hay página siguiente
    next_url = None
    if offset + limit < total_count:
        next_url = str(request.url.include_query_params(
            offset=offset + limit, 
            limit=limit
        ))
    
    # Determinar si hay página anterior
    previous_url = None
    if offset > 0:
        prev_offset = max(0, offset - limit)
        previous_url = str(request.url.include_query_params(
            offset=prev_offset, 
            limit=limit
        ))
    
    # Convertir resultados ORM a Pydantic models
    response_results = [response_schema.from_orm(r) for r in results]
    
    return PaginatedResponse[response_schema](
        count=total_count,
        next=next_url,
        previous=previous_url,
        results=response_results
    )