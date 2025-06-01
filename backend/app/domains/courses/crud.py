from typing import List

from fastapi import HTTPException
from fastapi_pagination import paginate
from fastapi_pagination.ext.sqlmodel import paginate
from sqlmodel import Session, select

from app.domains.courses.models import Course
from app.domains.courses.schemas import CourseCreate, CourseRead
from app.domains.professors.models import Professor
from app.domains.registrations.crud import delete_registrations_by_course_id
from app.domains.registrations.models import Register
from app.domains.students.models import Student
from app.domains.users.models import User, UserRole


def get_courses(db: Session) -> list[Course]:
    return paginate(db, select(Course))


def create_course(db: Session, course_in: CourseCreate, current_user: User) -> Course:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=400, detail="Only Allowed to Amin User")
    course = Course(**course_in.dict())
    stmt = select(Course).where(Course.name == course.name, Course.course_code == course.course_code)
    # 중복된 강의가 있는지 확인
    existing_course = db.exec(stmt).first()
    if existing_course:
        raise HTTPException(status_code=400, detail="Already Existing Course")
    db.add(course)
    db.commit()
    db.refresh(course)
    return course


def get_courses_by_department(db: Session, department_id: int) -> list[Course]:
    stmt = select(Course).where(Course.department_id == department_id)
    return db.exec(stmt).all()


def get_course(db: Session, course_id: int) -> Course | None:
    stmt = select(Course).where(Course.id == course_id)
    return db.exec(stmt).first()


def get_students_by_course(db: Session, course_id: int) -> List[Student]:
    stmt = (
        select(Student)
        .join(Register, Register.user_id == Student.id)
        .where(Register.course_id == course_id)
    )
    return db.exec(stmt).all()


def delete_course(db: Session, course: Course, current_user: User):
    deleted_registrations = delete_registrations_by_course_id(db, course.id, current_user)
    db.delete(course)
    db.commit()
    return None


def get_courses_by_professor(db: Session, current_user: User) -> List[CourseRead]:
    if current_user.role == UserRole.STUDENT:
        raise HTTPException(status_code=400, detail="This page is only for professor!")
    user_id = current_user.id
    professor = db.exec(select(User).where(User.id == user_id))
    if professor is None:
        raise HTTPException(status_code=400, detail=f"There is No Professor with {user_id}")
    stmt = (
        select(Course)
        .where(Course.user_id == user_id))
    course_list = db.exec(stmt).all()
    course_reads = [CourseRead.from_orm(c) for c in course_list]
    return course_reads
