from typing import List

from fastapi_pagination import paginate
from sqlmodel import Session, select

from app.domains.courses.models import Course
from app.domains.courses.schemas import CourseCreate
from app.domains.departments.models import Department
from app.domains.registrations.models import Register
from app.domains.students.models import Student


def get_courses(db: Session) -> list[Course]:
    stmt = select(Course)
    return paginate(db.exec(stmt).all())


def create_course(db: Session, course_in: CourseCreate) -> Course:
    course = Course(**course_in.dict())
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
        .join(Register, Register.student_id == Student.id)
        .where(Register.course_id == course_id)
    )
    return db.exec(stmt).all()
