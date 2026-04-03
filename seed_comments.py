import sys
import os
sys.path.append(os.getcwd())

from backend import models, database
from datetime import datetime, timedelta

def add_demo_comments():
    db = database.SessionLocal()
    try:
        demo_comments = [
            {
                "name": "Aisha Muhammadu",
                "content": "Gifthub is a total life-saver! That N50,000 really helped me cover my semester tuition. Thank you so much to the whole team! 🙏✨",
                "offset_days": 2
            },
            {
                "name": "Chidi Okoro",
                "content": "I was skeptical at first, but this platform is 100% transparent. Joining the waitlist was the best decision I've made this month. The community vibes are amazing!",
                "offset_days": 5
            },
            {
                "name": "Blessing Emeka",
                "content": "I just received my gift today! 😭😭 I honestly can't believe it's real. This came at the perfect time. Gifthub, you are truly amazing for what you do!",
                "offset_days": 1
            },
            {
                "name": "Umar Khalid",
                "content": "The referral system is so clever. I shared my link with my friends and moved up 10 spots in one day! Really looking forward to the next round.",
                "offset_days": 3
            },
            {
                "name": "Sarah Johnson",
                "content": "Finally a platform that actually cares about people. The UI is so clean and easy to use. Proud to be part of this community! ❤️",
                "offset_days": 0
            }
        ]

        for comment in demo_comments:
            # Check if exists to avoid duplicates
            exists = db.query(models.Comment).filter(models.Comment.name == comment["name"]).first()
            if not exists:
                new_comment = models.Comment(
                    name=comment["name"],
                    content=comment["content"],
                    created_at=datetime.utcnow() - timedelta(days=comment["offset_days"])
                )
                db.add(new_comment)
        
        db.commit()
        print("Demo comments added successfully!")
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    add_demo_comments()
