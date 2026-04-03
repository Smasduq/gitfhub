from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    name: str
    email: EmailStr
    mobile: str
    account_number: str
    bank_name: str
    referred_by_code: Optional[str] = None

class UserCreate(UserBase):
    pass

class UserResponse(UserBase):
    id: int
    referral_code: str
    referral_count: int
    created_at: datetime
    waitlist_position: int
    is_gifted: bool

    class Config:
        from_attributes = True

class WaitlistStatus(BaseModel):
    name: str
    email: str
    position: int
    total_on_waitlist: int
    referral_code: str
    referral_count: int

class CommentCreate(BaseModel):
    name: str
    content: str

class CommentResponse(CommentCreate):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
