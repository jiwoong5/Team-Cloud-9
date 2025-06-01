from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from app.db.session import get_db
from . import crud, schemas

router = APIRouter(prefix="/students", tags=["students"])

# 학생 생성
@router.post("/", response_model=schemas.StudentRead, status_code=status.HTTP_201_CREATED)
def add_student(student_in: schemas.StudentCreate, db: Session = Depends(get_db)):
    return crud.create_student(db, student_in)

# 전체 학생 조회
@router.get("/", response_model=list[schemas.StudentRead])
def read_students(db: Session = Depends(get_db)):
    return crud.get_students(db)

# student_id 학생 정보 조회
@router.get("/{student_id}", response_model=schemas.StudentRead)
def read_student(student_id: int, db: Session = Depends(get_db)):
    student = crud.get_student(db, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student