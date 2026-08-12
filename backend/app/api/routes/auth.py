from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_password, create_access_token, get_current_user
from app.crud.crud import get_user_by_username, get_users, create_user, update_user, delete_user
from app.schemas.schemas import Token, LoginForm, UserCreate, UserUpdate, UserOut

router = APIRouter(prefix="/api/auth", tags=["Auth"])


@router.post("/login", response_model=Token)
def login(form: LoginForm, db: Session = Depends(get_db)):
    user = get_user_by_username(db, form.username)
    if not user or not verify_password(form.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Identifiants invalides")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Compte désactivé")
    token = create_access_token({"sub": user.username})
    return {"access_token": token, "token_type": "bearer", "user": user}


@router.get("/me", response_model=UserOut)
def me(current_user=Depends(get_current_user)):
    return current_user


router_users = APIRouter(prefix="/api/users", tags=["Users"])


@router_users.get("", response_model=list[UserOut])
def list_users(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return get_users(db)


@router_users.post("", response_model=UserOut)
def add_user(user: UserCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if get_user_by_username(db, user.username):
        raise HTTPException(400, "Nom d'utilisateur déjà utilisé")
    return create_user(db, user)


@router_users.put("/{user_id}", response_model=UserOut)
def edit_user(user_id: int, user: UserUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    db_user = update_user(db, user_id, user)
    if not db_user:
        raise HTTPException(404, "Utilisateur non trouvé")
    return db_user


@router_users.delete("/{user_id}")
def remove_user(user_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    delete_user(db, user_id)
    return {"message": "Utilisateur désactivé"}
