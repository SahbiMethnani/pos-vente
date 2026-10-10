from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status, Header
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db
from app.core.master_database import MasterSessionLocal
from app.master_models import Client
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db), x_client_id: int | None = Header(None)):
    from app.crud.user import get_user_by_username
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token invalide ou expiré",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    # try main DB first
    user = get_user_by_username(db, username)
    if user and user.is_active:
        return user

    # if not found, and client id provided, try tenant DB
    if x_client_id:
        master_db = MasterSessionLocal()
        try:
            client = master_db.query(Client).filter(Client.id == x_client_id, Client.status == "approved").first()
            if client and client.db_path:
                client_db_url = f"sqlite:///{client.db_path}"
                engine = create_engine(client_db_url, connect_args={"check_same_thread": False})
                Session = sessionmaker(autocommit=False, autoflush=False, bind=engine)
                tenant_db = Session()
                try:
                    user = get_user_by_username(tenant_db, username)
                    if user and user.is_active:
                        return user
                finally:
                    tenant_db.close()
        finally:
            master_db.close()

    raise credentials_exception


def require_role(*roles: str):
    def role_checker(current_user=Depends(get_current_user)):
        if current_user.role not in roles:
            raise HTTPException(status_code=403, detail="Accès non autorisé")
        return current_user
    return role_checker
