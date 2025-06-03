import logging

from fastapi import APIRouter, Form, HTTPException, Response
from starlette.status import HTTP_200_OK, HTTP_204_NO_CONTENT
import os
import socket
import subprocess

router = APIRouter(prefix="")
logger = logging.getLogger("LOADTEST")


@router.post("/load", status_code=HTTP_204_NO_CONTENT)
async def load(duration: int = Form(...)):
    cpus = os.cpu_count() or 1

    try:
        subprocess.Popen(
            ["stress", "--cpu", str(cpus), "--timeout", str(duration)],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )
        return Response(status_code=204)
    except Exception as e:
        logger.error(f"Error getting load test info: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))  # 실패 시 500 에러
