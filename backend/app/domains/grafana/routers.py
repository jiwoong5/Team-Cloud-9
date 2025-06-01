from fastapi import APIRouter
from starlette.status import HTTP_200_OK

from app.domains.grafana.crud import get_cpu, get_memory

router = APIRouter(prefix="/grafana", tags=["monitor"])


@router.get("/cpu-usage", status_code=HTTP_200_OK)
async def get_cpu_usage():
    return get_cpu(1.0)


@router.get("/memory-usage", status_code=HTTP_200_OK)
async def get_memory_usage():
    return get_memory()


@router.get("/pod-status", status_code=HTTP_200_OK)
async def get_pod_status():
    return None


@router.get("/node-status", status_code=HTTP_200_OK)
async def get_node_status():
    return None


@router.get("/network-traffic", status_code=HTTP_200_OK)
async def get_network_traffic():
    return None

