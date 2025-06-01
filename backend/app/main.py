from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import create_engine
from sqlmodel import SQLModel

from app.core.config import settings
from app.domains.common.routers import router as common_router
from app.domains.courses.routers import router as course_router
from app.domains.grafana.routers import router as grafana_router
from app.domains.loadtest.routers import router as loadtest_router
from app.domains.registrations.routers import router as enrollment_router
from app.domains.students.routers import router as student_router
from app.domains.users.routers import router as auth_router
from app.exceptions import EntityNotFound, EntityAlreadyExists, BadRequest

app = FastAPI(title="Cloud Team9 Term Project", version="1.0.0", debug=True)

engine = create_engine(settings.DATABASE_URL, echo=True)

SQLModel.metadata.create_all(engine)

app.include_router(course_router, prefix="/api")
app.include_router(student_router, prefix="/api")
app.include_router(enrollment_router, prefix="/api")
app.include_router(auth_router, prefix="/api")
app.include_router(common_router, prefix="/api")
app.include_router(grafana_router, prefix="/api")
app.include_router(loadtest_router, prefix="/api")

# 프론트엔드 요청 허용
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 404 Not Found
@app.exception_handler(EntityNotFound)
async def not_found_handler(request: Request, exc: EntityNotFound):
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={
            "error": "EntityNotFound",
            "message": str(exc),
            "entity": exc.entity,
            "id": exc.pk
        }
    )


# 409 Conflict
@app.exception_handler(EntityAlreadyExists)
async def conflict_handler(request: Request, exc: EntityAlreadyExists):
    return JSONResponse(
        status_code=status.HTTP_409_CONFLICT,
        content={
            "error": "EntityAlreadyExists",
            "message": str(exc),
            "entity": exc.entity,
            "field": exc.field,
            "value": exc.value
        }
    )


# 400 Bad Request
@app.exception_handler(BadRequest)
async def bad_request_handler(request: Request, exc: BadRequest):
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "error": "BadRequest",
            "message": str(exc)
        }
    )
