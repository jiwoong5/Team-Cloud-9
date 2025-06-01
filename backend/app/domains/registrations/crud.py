import logging

from fastapi import HTTPException
from sqlalchemy.orm import Session as OrmSession
from sqlmodel import Session, select

import app.domains.courses.crud as course_crud
from .models import Register
from .schemas import RegisterCreate, SummarizedRegisterRead
from ..courses.models import Course
from ..users.models import User, UserRole

logger = logging.getLogger('uvicorn.error')


def get_registers(db: Session, user_id: int | None = None):
    stmt = select(Register)
    if user_id is not None:
        stmt = stmt.where(Register.user_id == user_id)
    return db.exec(stmt).all()


def register_student(db: Session, register_in: RegisterCreate, current_user: User) -> Register:
    register = Register(**register_in.dict())
    register.user_id = current_user.id
    course_id = register.course_id
    course = course_crud.get_course(db, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course Not found")
    if check_user_registered(db, register.user_id, course_id):
        raise HTTPException(status_code=400, detail="Already Registered in the course")

    db.add(register)
    db.commit()
    db.refresh(register)
    return register


def delete_register(db: Session, course_id: int, current_user: User):
    stmt = select(Register).where(Register.course_id == course_id,
                                  Register.user_id == current_user.id)
    register = db.exec(stmt).first()
    if not register:
        return None
    deleted_record = register
    db.delete(register)
    db.commit()
    return deleted_record


def get_register(db: OrmSession, course_id: int) -> list[Register] | None:
    return db.query(Register).where(Register.course_id == course_id).all()


def get_student_register(db: OrmSession, current_user: User) -> list[Register] | None:
    return db.query(Register).where(Register.user_id == current_user.id).all()


def check_user_registered(db: Session, user_id: int, course_id: int) -> bool:
    stmt = (
        select(Register)
        .where(Register.user_id == user_id,
               Register.course_id == course_id)
    )
    return db.exec(stmt).first() is not None


def delete_registrations_by_course_id(db: Session, course_id: int, current_user: User):
    if current_user.role != UserRole.ADMIN:
        return HTTPException(status_code=403, detail="Only Allowed to Admin User")
    stmt = select(Register).where(Register.course_id == course_id)
    register = db.exec(stmt).all()
    if not register:
        return None
    for r in register:
        db.delete(r)
    db.commit()
    return None


def get_summarized_registrations(db: Session, user: User) -> SummarizedRegisterRead:
    stmt = select(Register).where(Register.user_id == user.id)
    registers = db.exec(stmt).all()  # .all()로 리스트 형태로 받아야 함

    if not registers:
        # user.name 대신 실제 필드명이 username이라면 user.username 으로 바꿔 주세요.
        return SummarizedRegisterRead(user_name=user.username, credits=0)

    total_credits = 0
    for reg in registers:
        course = db.exec(
            select(Course).where(Course.id == reg.course_id)
        ).first()
        if course:
            total_credits += course.credits

    return SummarizedRegisterRead(
        user_name=user.username,  # 실제 필드명이 username인 경우 수정: user.username
        credits=total_credits)
