from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from . import crud, schemas
from app.domains.courses.schemas import CourseRead
from app.db.session import get_db

router = APIRouter(prefix="/registrations", tags=["registrations"])


# 수강 신청
@router.post("", response_model=schemas.RegisterRead, status_code=status.HTTP_201_CREATED)
def register(enroll_in: schemas.RegisterCreate, db: Session = Depends(get_db)):
    return crud.register_student(db, enroll_in)

# 학생 수강 신청 내역
@router.get("/{student_id}", response_model=list[schemas.RegisterRead])
def read_student_register(student_id: int, db: Session = Depends(get_db)):
    reg = crud.get_student_register(db, student_id)
    if not reg:
        raise HTTPException(status_code=404, detail="Register not found")
    return reg


# 수강 신청 삭제
@router.delete("/{register_id}", status_code=status.HTTP_204_NO_CONTENT)
def unregister(register_id: int, db: Session = Depends(get_db)):
    success = crud.delete_register(db, register_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Enrollment not found")
    # No return to produce 204 No Content


@router.get("/", response_model=list[schemas.RegisterRead])
def list_registers(student_id: int | None = None, db: Session = Depends(get_db)):
    return crud.get_registers(db, student_id)


@router.get("/{course_id}", response_model=list[schemas.RegisterRead])
def read_register(course_id: int, db: Session = Depends(get_db)):
    reg = crud.get_register(db, course_id)
    if not reg:
        raise HTTPException(status_code=404, detail="Register not found")
    return reg

# TODO - 수강 신청 경쟁률 확인
# TODO - 대기 목록 등록