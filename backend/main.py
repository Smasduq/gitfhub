import os
import uuid
from typing import List

from dotenv import load_dotenv
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

import models, schemas, database

# Load environment variables
load_dotenv()

# Initialize Database Schema
models.Base.metadata.create_all(bind=database.engine)

# Application Initialization
app = FastAPI(title="Gifthub API", description="Core API for the Gifthub platform.")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Dependencies ---

def get_db() -> Session:
    """Dependency to provide a databse session."""
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()


ADMIN_PASSPHRASE = os.getenv("ADMIN_PASSPHRASE")

def verify_admin(passphrase: str = Query(..., description="The highly secured authorization key.")) -> bool:
    """Dependency to protect administrator routes from unauthorized access."""
    if passphrase != ADMIN_PASSPHRASE:
        raise HTTPException(status_code=403, detail="Forbidden: Invalid Passphrase.")
    return True


# --- Core Logic & Helpers ---

def calculate_single_position(user: models.User, db: Session) -> int:
    """Calculates the waitlist position dynamically for a single user."""
    join_time_rank = db.query(models.User).filter(models.User.created_at < user.created_at).count() + 1
    referral_boost = user.referral_count
    return max(1, join_time_rank - referral_boost)


# --- Public Endpoints ---

@app.get("/")
def read_root():
    return {"message": "Welcome to Gifthub API"}


@app.post("/register", response_model=schemas.UserResponse)
def register_user(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    """Registers a new user or returns an existing one, providing their current rank."""
    db_user = db.query(models.User).filter(models.User.email == user_in.email).first()
    
    # Handle Return Customer
    if db_user:
        db_user.waitlist_position = calculate_single_position(db_user, db)
        return db_user

    # Handle Valid Referral Registration
    if user_in.referred_by_code:
        referrer = db.query(models.User).filter(models.User.referral_code == user_in.referred_by_code).first()
        if referrer:
            referrer.referral_count += 1
            db.commit()

    # Create User
    new_user = models.User(
        name=user_in.name,
        email=user_in.email,
        mobile=user_in.mobile,
        account_number=user_in.account_number,
        bank_name=user_in.bank_name,
        referred_by_code=user_in.referred_by_code,
        referral_code=str(uuid.uuid4())[:8]
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    new_user.waitlist_position = calculate_single_position(new_user, db)
    return new_user


@app.get("/status/{email}", response_model=schemas.WaitlistStatus)
def get_status(email: str, db: Session = Depends(get_db)):
    """Fetches the current waitlist status of an existing user by email."""
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    
    total = db.query(models.User).count()
    return {
        "name": user.name,
        "email": user.email,
        "position": calculate_single_position(user, db),
        "total_on_waitlist": total,
        "referral_code": user.referral_code,
        "referral_count": user.referral_count
    }


@app.get("/status/mobile/{mobile}", response_model=schemas.UserResponse)
def get_status_by_mobile(mobile: str, db: Session = Depends(get_db)):
    """Fetches the full user profile dashboard using their registered phone number."""
    user = db.query(models.User).filter(models.User.mobile == mobile).first()
    if not user:
        raise HTTPException(status_code=404, detail="No profile found for this phone number.")
    
    user.waitlist_position = calculate_single_position(user, db)
    return user



@app.get("/comments", response_model=List[schemas.CommentResponse])
def get_comments(db: Session = Depends(get_db)):
    """Retrieves the newest 20 community comments for the platform."""
    return db.query(models.Comment).order_by(models.Comment.created_at.desc()).limit(20).all()


@app.post("/comments", response_model=schemas.CommentResponse)
def create_comment(comment: schemas.CommentCreate, db: Session = Depends(get_db)):
    """Allows a user to post a public community testimonial."""
    new_comment = models.Comment(name=comment.name, content=comment.content)
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)
    return new_comment


# --- Administrator Endpoints ---

@app.get("/admin/users", response_model=List[schemas.UserResponse], dependencies=[Depends(verify_admin)])
def admin_get_users(db: Session = Depends(get_db)):
    """
    Fetches all registered applicants. 
    Optimized O(N) calculation to prevent database timeouts on large lists.
    """
    # Sort chronologically to deduce ranks optimally in a single pass
    users_asc = db.query(models.User).order_by(models.User.created_at.asc()).all()
    
    for index, user in enumerate(users_asc):
        join_time_rank = index + 1
        user.waitlist_position = max(1, join_time_rank - user.referral_count)

    # Return descending so the newest registrations show first in the dashboard
    return sorted(users_asc, key=lambda x: x.created_at, reverse=True)


@app.put("/admin/users/{user_id}/gift", dependencies=[Depends(verify_admin)])
def admin_gift_user(user_id: int, db: Session = Depends(get_db)):
    """Updates an applicant's status marking them as successfully gifted."""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Applicant not found.")
    
    user.is_gifted = True
    db.commit()
    return {"message": f"Applicant {user.name} successfully marked as gifted."}


@app.get("/admin/comments", response_model=List[schemas.CommentResponse], dependencies=[Depends(verify_admin)])
def admin_get_comments(db: Session = Depends(get_db)):
    """Retrieves all comments for deeper administration analysis."""
    return db.query(models.Comment).order_by(models.Comment.created_at.desc()).all()


@app.delete("/admin/comments/{comment_id}", dependencies=[Depends(verify_admin)])
def admin_delete_comment(comment_id: int, db: Session = Depends(get_db)):
    """Allows administrators to moderate/delete inappropriate community feed comments."""
    comment = db.query(models.Comment).filter(models.Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found.")
    
    db.delete(comment)
    db.commit()
    return {"message": "Comment successfully removed."}
