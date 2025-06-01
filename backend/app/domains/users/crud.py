import logging
from typing import Optional, List

from fastapi import HTTPException
from passlib.context import CryptContext
from pydantic import EmailStr
from sqlmodel import Session, select

from app.domains.students.models import Student
from app.domains.students.schemas import StudentCreate
from app.domains.users.models import User, UserRole
from app.domains.users.schemas import UserCreate, UserResponse

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
logger = logging.getLogger('uvicorn.error')


class UserCRUD:

    def __init__(self, session: Session):
        super().__init__()
        self.session = session

    def get_password_hash(self, password: str):
        return pwd_context.hash(password)

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        return pwd_context.verify(plain_password, hashed_password)

    def create_user(self, user_data: UserCreate) -> Optional[User]:
        try:
            hashed_password = self.get_password_hash(user_data.password)
            user = User(
                username=user_data.username,
                email=user_data.email,
                hashed_password=hashed_password,
                role=user_data.role
            )
            self.session.add(user)
            self.session.commit()
            self.session.refresh(user)
            return user
        except Exception as e:
            logger.error(f"create_user 실패: {e}", exc_info=True)
            self.session.rollback()
            return None

    def create_student_profile(self, user: User, student_data: StudentCreate) -> Optional[Student]:
        try:
            student = Student(
                user_id=user.id,
                name=student_data.name,
                email=user.email
            )
            self.session.add(student)
            self.session.commit()
            self.session.refresh(student)
            return student
        except Exception as e:
            logger.info(f"create_student profile failure: {e}", exc_info=True)
            self.session.rollback()
            return None

    def get_user_by_username(self, username: str) -> User | None:
        statement = select(User).where(User.username == username)
        user = self.session.exec(statement).first()
        return user

    def get_user_by_email(self, email: EmailStr) -> Optional[User]:
        statement = select(User).where(User.email == email)
        return self.session.exec(statement).first()

    def get_user(self, user_id: int) -> Optional[UserResponse]:
        statement = select(User).where(User.id == user_id)
        user = self.session.exec(statement).first()
        if user is None:
            raise HTTPException(status_code=404, detail=f"There is no user with {user_id}")
        return UserResponse.model_validate(user)

    def authenticate_user(self, username: str, password: str) -> Optional[User]:
        user = self.get_user_by_username(username)
        if not user or not self.verify_password(password, user.hashed_password):
            return None
        return user

    def check_user_permission(self, user: User, required_roles: List[UserRole]) -> bool:
        return user.role in required_roles and user.is_active
