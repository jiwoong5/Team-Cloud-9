from typing import List

from fastapi import APIRouter, Depends, HTTPException, Security
from fastapi_pagination import Page, add_pagination
from sqlalchemy.orm import Session
from starlette import status

from app.core.security import get_current_user
from app.db.session import get_db
from app.domains.courses import schemas, crud
from app.domains.students.schemas import StudentRead
from app.domains.users.models import User

router = APIRouter(tags=["courses"],
                   prefix="/admin/courses",
                   dependencies=[Security(get_current_user, scopes=[])])


# 강의 리스트 페이지네이션
@router.get("", response_model=Page[schemas.CourseRead])
def read_courses(db: Session = Depends(get_db)):
    return crud.get_courses(db)


add_pagination(router)


# 강의 개설
@router.post("", response_model=schemas.CourseRead, status_code=status.HTTP_201_CREATED)
def add_course(
        course_in: schemas.CourseCreate,
        db: Session = Depends(get_db),
        current_users: User = Depends(get_current_user)):
    new_course = crud.create_course(db, course_in, current_users)
    if new_course is None:
        return HTTPException(status_code=400, detail="Already Registered Course")
    return new_course



# 교수별 강의 조회
@router.get("/professor", response_model=list[schemas.CourseRead])
def get_courses_by_professor(db: Session = Depends(get_db),
                             current_user: User = Depends(get_current_user)):
    return crud.get_courses_by_professor(db,current_user)

# 해당 학부 강의 리스트
@router.get("/{department_id}", response_model=List[schemas.CourseRead])
def read_course_by_department(department_id: int, db: Session = Depends(get_db)):
    return crud.get_courses_by_department(db, department_id)


# 해당 강의의 수강 학생 리스트
@router.get("/{course_id}/students", response_model=List[StudentRead])
def read_students_by_course(course_id: int, db: Session = Depends(get_db)):
    return crud.get_students_by_course(db, course_id)


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


# TODO delete api/admin/courses/${id} 사용 시 강의삭제 할 때 registration 이 외래키로 course id 사용중이여서 삭제 안됨. 같이 삭제 되도록.
# 강의가 삭제된다면 모든 수강 신청도 삭제되도록 변경
# 강의 삭제
@router.delete("/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_course(
        course_id: int,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    course = crud.get_course(db, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    crud.delete_course(db, course, current_user)
    return


@router.get("/{course_id}", response_model=schemas.CourseRead)
def read_course(course_id: int, db: Session = Depends(get_db)):
    course = crud.get_course(db, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course

