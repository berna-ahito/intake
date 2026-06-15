import json
from sqlalchemy.orm import Session
from app.db.session import SessionLocal, engine, Base
from app.db.models import Submission, AuditLog

Base.metadata.create_all(bind=engine)

seeds = [
    {
        "source": "form",
        "raw_content": "Name: John Smith\nCompany: TechFlow\nEmail: john@techflow.com\nPhone: 555-1234\nBudget: $100k\nNeed: Looking for a complete CRM overhaul.",
    },
    {
        "source": "email",
        "raw_content": "Hey team, just had a great call with Sarah from Global Industries. They want to move fast (ASAP) and have about 50k to spend. Can someone follow up? email is sarah@global.ind",
    },
    {
        "source": "partner",
        "raw_content": "Partner Referral from AgencyX.\nLead: Mike Ross, Pearson Specter.\nNotes: Great lead, very interested in your services. Please contact him.",
    },
    {
        "source": "form",
        "raw_content": "Name: Duplicate Test\nCompany: Acme Corp\nMessage: We already exist in your system but here is another form fill just in case.",
    },
    {
        "source": "email",
        "raw_content": "Hi, I'm the CEO of StartupX. We have a budget of $1M, wait actually my cofounder said $50k. Please advise. My phone is 555-9999.",
    },
    {
        "source": "form",
        "raw_content": "Name: Elon M\nCompany: Aerospace Corp\nBudget: $500,000,000\nNeed: Rockets.",
    },
    {
        "source": "email",
        "raw_content": "Hi, i need sumthing idk what u guys do rly but call me 555-8888",
    },
    {
        "source": "upload",
        "raw_content": "Attached file: proposal.pdf\nExtracted text: We are proposing a merger. ACME corp. Confidential.",
    }
]

def seed_db():
    db = SessionLocal()
    for s in seeds:
        sub = Submission(source=s["source"], raw_content=s["raw_content"])
        db.add(sub)
        db.commit()
        db.refresh(sub)

        # log
        log = AuditLog(submission_id=sub.id, action="created", details="Seeded demo data")
        db.add(log)
        db.commit()
        print(f"Seeded submission {sub.id}")

    db.close()
    print("Seeding complete.")

if __name__ == "__main__":
    seed_db()
