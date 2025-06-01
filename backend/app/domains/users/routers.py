import logging
from datetime import datetime, timedelta
from typing import Optional, List

from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError
from jose import jwt
from sqlmodel import Session

from app.core.config import Settings
from app.db.session import get_db as get_session, get_db
from app.domains.users.crud import UserCRUD
from app.domains.users.models import User, UserRole
from app.domains.users.schemas import UserCreate, Token, UserLogin, UserResponse

settings = Settings()
security = HTTPBearer()

router = APIRouter(tags=["Authentication"])
logger = logging.getLogger("uvicorn.error")


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


async def get_current_user(
        credentials: HTTPAuthorizationCredentials = Depends(security),
        session: Session = Depends(get_session)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        token = credentials.credentials
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user_crud = UserCRUD(session)
    user = user_crud.get_user_by_username(username)
    if user is None:
        raise credentials_exception
    return user


def require_roles(allowed_roles: List[UserRole]):
    def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions"
            )
        return current_user

    return role_checker


@router.post("/register")
async def register(
        user_data: UserCreate,
        session: Session = Depends(get_db)):
    try:
        user_crud = UserCRUD(session)

        # Check existing user
        if user_crud.get_user_by_username(user_data.username):
            raise HTTPException(status_code=400, detail="Username already exists")

        if user_crud.get_user_by_email(user_data.email):
            raise HTTPException(status_code=400, detail="Email already exists")

        # Create user
        user = user_crud.create_user(user_data)
        if not user:
            raise HTTPException(status_code=500, detail="Failed to create user")

        return {"message": "User registered successfully", "user_id": user.id}
    except Exception as e:
        logger.error(f"register_student에서 예외 발생: {e}", exc_info=True)
        raise


@router.post("/login", response_model=Token)
async def login(user_data: UserLogin, session: Session = Depends(get_session)):
    user_crud = UserCRUD(session)
    user = user_crud.authenticate_user(user_data.username, user_data.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )

    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")

    access_token = create_access_token(
        data={"sub": user.username},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/profile", response_model=UserResponse)
async def get_profile(
        current_user: User = Depends(get_current_user),
        session: Session = Depends(get_session)
):
    user_crud = UserCRUD(session)
    return user_crud.get_user(current_user.id)


@router.get("/admin/users")
async def get_all_users(
        current_user: User = Depends(require_roles([UserRole.ADMIN])),
):
    return {"message": "Admin access granted", "user": current_user.username}


@router.get("/dashboard")
async def student_dashboard(
        current_user: User = Depends(require_roles([UserRole.STUDENT])),
):
    return {"message": f"Welcome student {current_user.username}"}
