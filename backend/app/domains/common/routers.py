from fastapi import APIRouter
from starlette import status

from app.domains.common.crud import get_date_and_time
from app.domains.common.schemas import ServerTimeRead

router = APIRouter(tags=["commons"])


@router.post(path="/getServerTime",response_model=ServerTimeRead, status_code=status.HTTP_200_OK)
async def get_server_time():
    return get_date_and_time()