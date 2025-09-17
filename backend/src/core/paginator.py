from pydantic import BaseModel
from typing import Generic, TypeVar, Optional
from fastapi import Request
from urllib.parse import urlencode
from sqlalchemy.ext.asyncio import AsyncSession
from ..auth.models import Base
from sqlalchemy import select,func
from typing import Sequence

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
    query,
    results: Sequence[T],
    session: AsyncSession,
    response_schema: BaseModel
) -> PaginatedResponse[BaseModel]:
    """Genera los enlaces next y previous al estilo Django"""
    if len(results) == 0:
        return PaginatedResponse[response_schema](
        count=0,
        next=None,
        previous=None,
        results=[]
    )
    #Obtener el conteo total
    count_query = query.with_only_columns(func.count(), maintain_column_froms=True)
    total_count_result = await session.execute(count_query)
    total_count = total_count_result.scalar()
    
    # Obtener los parámetros de query actuales
    current_params = dict(request.query_params)
    
    # Determinar si hay página siguiente
    next_url = None
    if offset + limit < total_count:
        next_params = current_params.copy()
        next_params["offset"] = str(offset + limit)
        next_params["limit"] = str(limit)
        next_url = f"{request.url.path}?{urlencode(next_params)}"
    
    # Determinar si hay página anterior
    previous_url = None
    if offset > 0:
        prev_offset = max(0, offset - limit)
        prev_params = current_params.copy()
        prev_params["offset"] = str(prev_offset)
        prev_params["limit"] = str(limit)
        previous_url = f"{request.url.path}?{urlencode(prev_params)}"
    
    # Convertir resultados ORM a Pydantic models
    response_results = [response_schema.from_orm(r) for r in results]
    
    return PaginatedResponse[response_schema](
        count=total_count,
        next=next_url,
        previous=previous_url,
        results=response_results
    )