from typing import List

from fastapi import HTTPException
from fastapi_pagination import paginate, Params
from fastapi_pagination.ext.sqlmodel import paginate
from sqlmodel import Session, select, delete

from app.domains.courses.models import Course
from app.domains.courses.schemas import CourseCreate, CourseRead
from app.domains.registrations.models import Register
from app.domains.users.models import User, UserRole
from app.domains.users.schemas import UserRead


async def get_courses_with_pagination(db: Session, params: Params) -> list[Course]:
    return paginate(db, select(Course), params=params)


async def create_course(db: Session, course_in: CourseCreate, current_user: User) -> Course:
    if current_user.role not in {UserRole.PROFESSOR, UserRole.ADMIN}:
        raise HTTPException(status_code=403, detail="Only Allowed to Admin User")
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


async def get_courses_by_department(db: Session, department_id: int) -> list[Course]:
    stmt = select(Course).where(Course.department_id == department_id)
    return db.exec(stmt).all()


async def get_course(db: Session, course_id: int) -> Course | None:
    stmt = select(Course).where(Course.id == course_id)
    return db.exec(stmt).first()


async def get_students_by_course(db: Session, course_id: int) -> List[UserRead]:
    if get_course(db, course_id) is None:
        raise HTTPException(status_code=404, detail=f"Not found Course with ID {course_id}")
    stmt = (
        select(User)
        .join(Register, Register.user_id == User.id)
        .where(Register.course_id == course_id)
    )
    user_list = db.exec(stmt).all()
    student_list = [UserRead.model_validate(user) for user in user_list]
    return student_list


async def delete_course(db: Session, course: Course, current_user: User):
    if current_user.role not in (UserRole.PROFESSOR, UserRole.ADMIN):
        raise HTTPException(status_code=403, detail="Only Allowed for Admin or Professor")

    delete_stmt = delete(Register).where(Register.course_id == course.id)
    db.exec(delete_stmt)
    db.delete(course)
    db.commit()


async def get_courses_by_professor(db: Session, current_user: User) -> List[CourseRead]:
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
    course_reads = [CourseRead.model_validate(c) for c in course_list]
    return course_reads
