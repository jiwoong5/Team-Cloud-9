from sqlalchemy.orm import Session as OrmSession
from sqlmodel import Session, select

from .models import Register
from .schemas import RegisterCreate
from ..courses.models import Course


def get_registers(db: Session, student_id: int | None = None):
    stmt = select(Register)
    if student_id is not None:
        stmt = stmt.where(Register.student_id == student_id)
    return db.exec(stmt).all()


def register_student(db: Session, register_in: RegisterCreate) -> Register:
    register = Register(**register_in.dict())
    db.add(register)
    db.commit()
    db.refresh(register)
    return register


def delete_register(db: Session, register_id: int):
    register = db.get(Register, register_id)
    if not register:
        return None
    course = db.get(Course, register.course_id)
    db.delete(register)
    return course


def get_register(db: OrmSession, course_id: int) -> list[Register] | None:
    return db.query(Register).where(Register.course_id == course_id).all()


def get_student_register(db: OrmSession, student_id: int) -> list[Register] | None:
    return db.query(Register).where(Register.student_id == student_id).all()
