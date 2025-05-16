# Ensure SQLModel metadata includes all models
from sqlmodel import create_engine, Session

import app.domains.courses.models  # noqa: F401
import app.domains.departments.models  # noqa: F401
import app.domains.professors.models  # noqa: F401
import app.domains.registrations.models  # noqa: F401
import app.domains.students.models  # noqa: F401
from app.core.config import settings

# app/db/session.py

engine = create_engine(settings.DATABASE_URL, echo=True)


def get_db():
    with Session(engine) as session:
        yield session
