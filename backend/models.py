from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    mobile = Column(String)
    account_number = Column(String)
    bank_name = Column(String)
    is_gifted = Column(Boolean, default=False)
    referral_code = Column(String, unique=True, default=lambda: str(uuid.uuid4())[:8])
    referred_by_code = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Simple waitlist position logic: Position = index in the table, 
    # but we'll calculate it dynamically based on referrals too.
    referral_count = Column(Integer, default=0)

class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    content = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
