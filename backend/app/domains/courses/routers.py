from typing import List

from fastapi import APIRouter, Depends, HTTPException
from fastapi_pagination import Page, add_pagination
from sqlalchemy.orm import Session
from starlette import status

from app.db.session import get_db
from app.domains.courses import schemas, crud
from app.domains.students.schemas import StudentRead

router = APIRouter(tags=["courses"], prefix="/admin/courses")


# 전체 강의 리스트 (페이지네이션)
@router.get("/", response_model=Page[schemas.CourseRead])
def read_courses(db: Session = Depends(get_db)):
    return crud.get_courses(db)


add_pagination(router)


# 강의 개설
@router.post("", response_model=schemas.CourseRead, status_code=status.HTTP_201_CREATED)
def add_course(
        course_in: schemas.CourseCreate,
        db: Session = Depends(get_db)
):
    new_course = crud.create_course(db, course_in)
    return new_course


# 해당 학부 강의 리스트 (경로명 충돌 방지)
@router.get("/by-department/{department_id}", response_model=List[schemas.CourseRead])
def read_course_by_department(department_id: int, db: Session = Depends(get_db)):
    return crud.get_courses_by_department(db, department_id)


# 해당 강의의 수강 학생 리스트
@router.get("/{course_id}/students", response_model=List[StudentRead])
def read_students_by_course(course_id: int, db: Session = Depends(get_db)):
    return crud.get_students_by_course(db, course_id)


# 강의 조회 (단일 강의)
@router.get("/{course_id}", response_model=schemas.CourseRead)
def read_course(course_id: int, db: Session = Depends(get_db)):
    course = crud.get_course(db, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course


# 강의 업데이트
@router.put("/{course_id}", response_model=schemas.CourseRead)
def update_course(
        course_id: int,
        course_in: schemas.CourseUpdate,
        db: Session = Depends(get_db)
):
    course = crud.get_course(db, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    course.name = course_in.name
    course.description = course_in.description
    db.add(course)
    db.commit()
    db.refresh(course)
    return course


# 강의 삭제
@router.delete("/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_course(course_id: int, db: Session = Depends(get_db)):
    course = crud.get_course(db, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    db.delete(course)
    db.commit()
