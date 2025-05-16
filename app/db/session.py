# Ensure SQLModel metadata includes all models
import app.domains.courses.models     # noqa: F401
import app.domains.professors.models  # noqa: F401
import app.domains.departments.models # noqa: F401
import app.domains.students.models    # noqa: F401
import app.domains.registrations.models # noqa: F401
# app/db/session.py

from sqlmodel import create_engine, Session

from app.core.config import settings

engine = create_engine(settings.DATABASE_URL, echo=True)


def get_db():
    with Session(engine) as session:
        yield session
