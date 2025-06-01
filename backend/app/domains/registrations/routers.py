from fastapi import APIRouter, Depends, HTTPException, status, Security
from sqlmodel import Session

from app.db.session import get_db
from . import crud, schemas
from ..users.models import User
from ...core.security import get_current_user

router = APIRouter(
    prefix="/registrations",
    tags=["registrations"],
    dependencies=[Security(get_current_user, scopes=[])]
)


# 수강 신청
@router.post("", response_model=schemas.RegisterRead, status_code=status.HTTP_201_CREATED)
def register(enroll_in: schemas.RegisterCreate, current_user: User = Depends(get_current_user),
             db: Session = Depends(get_db)):
    return crud.register_student(db, enroll_in, current_user)


# 자신이 수강 신청한 과목 조회
@router.get("", response_model=list[schemas.RegisterRead])
def read_student_register(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    reg = crud.get_student_register(db, current_user)
    return reg


@router.get("/summary", response_model=schemas.SummarizedRegisterRead)
async def retrieve_summarized_registration(db: Session = Depends(get_db),
                                           current_user: User = Depends(get_current_user)):
    return crud.get_summarized_registrations(db, current_user)


# 수강 신청 삭제
@router.delete("/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
def unregister(course_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    success = crud.delete_register(db, course_id, current_user)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Enrollment not found")
    # No return to produce 204 No Content


# @router.get("/", response_model=list[schemas.RegisterRead])
# def list_registers(student_id: int | None = None, db: Session = Depends(get_db)):
#     return crud.get_registers(db, student_id)


@router.get("/{course_id}", response_model=list[schemas.RegisterRead])
def read_register(course_id: int, db: Session = Depends(get_db)):
    reg = crud.get_register(db, course_id)
    if not reg:
        raise HTTPException(status_code=404, detail="Register not found")
    return reg

# TODO - 수강 신청 경쟁률 확인
# TODO - 대기 목록 등록
