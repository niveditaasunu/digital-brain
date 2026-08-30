from datetime import datetime, timedelta, timezone
import hashlib
import os

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from pydantic import BaseModel, EmailStr

from ..database import get_driver


router = APIRouter(
    prefix="/api/auth",
    tags=["auth"],
)


# ============================================================
# CONFIG
# ============================================================

SECRET_KEY = os.getenv(
    "SECRET_KEY",
    "CHANGE_THIS_TO_A_LONG_RANDOM_SECRET",
)

ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7

security = HTTPBearer()


# ============================================================
# REQUEST / RESPONSE MODELS
# ============================================================

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ============================================================
# PASSWORD HELPERS
# ============================================================

def hash_password(password: str) -> str:
    """
    Hash password using SHA-256.

    SHA-256 is used here to avoid the bcrypt
    72-byte password limitation encountered earlier.
    """

    return hashlib.sha256(
        password.encode("utf-8")
    ).hexdigest()


def verify_password(
    plain_password: str,
    hashed_password: str,
) -> bool:

    return (
        hash_password(plain_password)
        == hashed_password
    )


# ============================================================
# JWT
# ============================================================

def create_access_token(user_id: str) -> str:

    expire = (
        datetime.now(timezone.utc)
        + timedelta(
            minutes=ACCESS_TOKEN_EXPIRE_MINUTES
        )
    )

    payload = {
        "sub": user_id,
        "exp": expire,
    }

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM,
    )


# ============================================================
# GET CURRENT USER
# ============================================================

def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(
        security
    ),
) -> str:

    token = credentials.credentials

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )

        user_id = payload.get("sub")

        if not user_id:

            raise HTTPException(
                status_code=401,
                detail="Invalid authentication token.",
            )

        return user_id

    except JWTError:

        raise HTTPException(
            status_code=401,
            detail="Invalid or expired authentication token.",
        )


# ============================================================
# REGISTER
# ============================================================

@router.post(
    "/register",
    response_model=AuthResponse,
    status_code=201,
)
def register(
    payload: RegisterRequest,
):

    driver = get_driver()

    email = payload.email.lower().strip()

    with driver.session() as session:

        existing = session.run(
            """
            MATCH (u:User {email: $email})
            RETURN u
            """,
            email=email,
        ).single()

        if existing:

            raise HTTPException(
                status_code=409,
                detail="An account with this email already exists.",
            )

        password_hash = hash_password(
            payload.password
        )

        user_result = session.run(
            """
            CREATE (u:User {
                id: randomUUID(),
                email: $email,
                password_hash: $password_hash,
                created_at: $created_at
            })

            RETURN u.id AS id
            """,
            email=email,
            password_hash=password_hash,
            created_at=datetime.now(
                timezone.utc
            ).isoformat(),
        )

        record = user_result.single()

        if record is None:

            raise HTTPException(
                status_code=500,
                detail="Could not create account.",
            )

        token = create_access_token(
            record["id"]
        )

        return AuthResponse(
            access_token=token,
            token_type="bearer",
        )


# ============================================================
# LOGIN
# ============================================================

@router.post(
    "/login",
    response_model=AuthResponse,
)
def login(
    payload: LoginRequest,
):

    driver = get_driver()

    email = payload.email.lower().strip()

    with driver.session() as session:

        result = session.run(
            """
            MATCH (u:User {email: $email})

            RETURN
                u.id AS id,
                u.password_hash AS password_hash
            """,
            email=email,
        )

        record = result.single()

        if record is None:

            raise HTTPException(
                status_code=401,
                detail="Invalid email or password.",
            )

        if not verify_password(
            payload.password,
            record["password_hash"],
        ):

            raise HTTPException(
                status_code=401,
                detail="Invalid email or password.",
            )

        token = create_access_token(
            record["id"]
        )

        return AuthResponse(
            access_token=token,
            token_type="bearer",
        )