from sqlalchemy.orm import Session

from app.domains.students.models import Student
from app.domains.students.schemas import StudentCreate


def get_student(db: Session, student_id: int) -> Student | None:
    return db.get(Student, student_id)


def create_student(db: Session, student_in: StudentCreate) -> Student:
    student = Student(**student_in.dict())
    db.add(student)
    db.commit()
    db.refresh(student)
    return student


def get_students(db: Session)-> list[Student]:
    return db.query(Student).all()
