from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, AuthProvider, UserRole, UserStatus
from app.schemas.auth import (
    SignupRequest,
    LoginRequest,
    GoogleAuthRequest,
    AuthMessageResponse,
    UserAuthResponse,
)
from app.utils.security import (
    hash_password,
    verify_password,
    create_access_token,
    set_auth_cookie,
    clear_auth_cookie,
    verify_google_token,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/signup", response_model=AuthMessageResponse, status_code=status.HTTP_201_CREATED)
def signup(req: SignupRequest, response: Response, db: Session = Depends(get_db)):
    """
    Register a new local user with email & password.
    Sets HttpOnly session cookie on response.
    """
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == req.email.lower().strip()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    # Hash password & save user
    hashed_pw = hash_password(req.password)
    new_user = User(
        name=req.name.strip(),
        email=req.email.lower().strip(),
        password_hash=hashed_pw,
        auth_provider=AuthProvider.LOCAL,
        role=UserRole.USER,
        status=UserStatus.ACTIVE,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Issue JWT & set cookie
    token = create_access_token({"sub": str(new_user.user_id), "email": new_user.email, "role": new_user.role.value})
    set_auth_cookie(response, token)

    return AuthMessageResponse(
        message="Account created successfully",
        user=UserAuthResponse.model_validate(new_user),
    )


@router.post("/login", response_model=AuthMessageResponse)
def login(req: LoginRequest, response: Response, db: Session = Depends(get_db)):
    """
    Authenticate a local user with email and password.
    Sets HttpOnly session cookie on response.
    """
    user = db.query(User).filter(User.email == req.email.lower().strip()).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    if user.auth_provider == AuthProvider.GOOGLE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This account is registered with Google. Please use 'Sign in with Google'.",
        )

    if not verify_password(req.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    if user.status == UserStatus.BANNED:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been suspended. Please contact support.",
        )

    # Issue JWT & set cookie
    token = create_access_token({"sub": str(user.user_id), "email": user.email, "role": user.role.value})
    set_auth_cookie(response, token)

    return AuthMessageResponse(
        message="Login successful",
        user=UserAuthResponse.model_validate(user),
    )


@router.post("/google", response_model=AuthMessageResponse)
def google_auth(req: GoogleAuthRequest, response: Response, db: Session = Depends(get_db)):
    """
    Verify Google ID token and log in or register user.
    Sets HttpOnly session cookie on response.
    """
    id_info = verify_google_token(req.credential)
    google_id = id_info.get("sub")
    email = id_info.get("email")
    name = id_info.get("name") or email.split("@")[0]

    if not google_id or not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Google token payload.",
        )

    email = email.lower().strip()

    # 1. Check if user already exists by google_id
    user = db.query(User).filter(User.google_id == google_id).first()

    if user:
        if user.status == UserStatus.BANNED:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your account has been suspended. Please contact support.",
            )
    else:
        # 2. Check if email exists with local provider
        existing_email_user = db.query(User).filter(User.email == email).first()
        if existing_email_user:
            if existing_email_user.auth_provider == AuthProvider.LOCAL:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="An account with this email was registered using email/password. Please log in using your password.",
                )
            user = existing_email_user
        else:
            # 3. Create new user with Google auth provider
            user = User(
                name=name.strip(),
                email=email,
                auth_provider=AuthProvider.GOOGLE,
                google_id=google_id,
                role=UserRole.USER,
                status=UserStatus.ACTIVE,
            )
            db.add(user)
            db.commit()
            db.refresh(user)

    # Issue JWT & set cookie
    token = create_access_token({"sub": str(user.user_id), "email": user.email, "role": user.role.value})
    set_auth_cookie(response, token)

    return AuthMessageResponse(
        message="Google authentication successful",
        user=UserAuthResponse.model_validate(user),
    )


@router.post("/logout")
def logout(response: Response):
    """
    Clear the session cookie to log the user out.
    """
    clear_auth_cookie(response)
    return {"message": "Logged out successfully"}
