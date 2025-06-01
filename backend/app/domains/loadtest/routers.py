from fastapi import APIRouter
from starlette.status import HTTP_200_OK

router = APIRouter(prefix="/hap", tags=['load test'])


@router.post("/loadtest", status_code=HTTP_200_OK)
async def loadtest():
    return None
