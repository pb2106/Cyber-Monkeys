"""
Database seeding script for Prüfen development.
Creates mock users, verifiers, and test data.
"""
from datetime import date
import sys
import os

# Add parent directory to path to import modules
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal, engine
import models
from models import Base
import auth


def seed_database():
    """
    Seed the database with mock verifiers and users.
    Skips records that already exist (idempotent).
    Returns True if any new data was inserted.
    """
    # Create tables
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    seeded = False

    try:
        print("🌱 Seeding database...")

        # Create verifiers
        verifiers_data = [
            {
                "company_name": "AlcoholDelivery.com",
                "domain": "alcoholdelivery.com",
                "api_key": "pk_4cZLBbGW4jAcbNBNw5KmTG1R4Bx49kFoTjFDizaRZEA"
            },
            {
                "company_name": "OnlineCasino.io",
                "domain": "onlinecasino.io",
                "api_key": "pk_motlljUo4BsMnXslYtTyiq2lrDMp13lCpZXJkE89vNk"
            },
            {
                "company_name": "StreamingService",
                "domain": "streaming.tv",
                "api_key": "pk_D9rCkll5Mn6Qc0o8QgOp5XYv4v8gvgDAQEqYuHS93rU"
            }
        ]

        for v_data in verifiers_data:
            existing = db.query(models.Verifier).filter_by(domain=v_data["domain"]).first()
            if not existing:
                verifier = models.Verifier(**v_data)
                db.add(verifier)
                print(f"✓ Created verifier: {v_data['company_name']}")
                print(f"  API Key: {v_data['api_key']}")
                seeded = True

        # Create mock users
        users_data = [
            {
                "user_id": "usr_demo_adult",
                "email": "john@example.com",
                "password": "password123",
                "name": "John Doe",
                "dob": date(1990, 5, 15)  # 34 years old - passes 18+ and 21+
            },
            {
                "user_id": "usr_demo_teen",
                "email": "jane@example.com",
                "password": "password123",
                "name": "Jane Smith",
                "dob": date(2010, 8, 20)  # 14 years old - fails both
            },
            {
                "user_id": "usr_demo_young_adult",
                "email": "bob@example.com",
                "password": "password123",
                "name": "Bob Johnson",
                "dob": date(2004, 3, 10)  # 20 years old - passes 18+ but fails 21+
            },
            {
                "user_id": "usr_demo_senior",
                "email": "alice@example.com",
                "password": "password123",
                "name": "Alice Williams",
                "dob": date(1985, 12, 1)  # 38 years old - passes both
            }
        ]

        for u_data in users_data:
            existing = db.query(models.MockUser).filter_by(email=u_data["email"]).first()
            if not existing:
                user = models.MockUser(
                    user_id=u_data["user_id"],
                    email=u_data["email"],
                    password_hash=auth.hash_password(u_data["password"]),
                    name=u_data["name"],
                    dob=u_data["dob"]
                )
                db.add(user)
                age = (date.today() - u_data["dob"]).days // 365
                print(f"✓ Created user: {u_data['email']} (ID: {u_data['user_id']}, Age: {age})")
                seeded = True

        db.commit()

        if seeded:
            print("\n✅ Database seeded successfully!")
            print("\n📋 Test Accounts:")
            print("=" * 50)

            for u in users_data:
                age = (date.today() - u["dob"]).days // 365
                print(f"\nEmail: {u['email']}")
                print(f"Password: {u['password']}")
                print(f"Age: {age} years")
                print(f"  Age 18+: {'✓ PASS' if age >= 18 else '✗ FAIL'}")
                print(f"  Age 21+: {'✓ PASS' if age >= 21 else '✗ FAIL'}")

            print("\n" + "=" * 50)
            print("\n🔑 Verifier API Keys:")
            print("=" * 50)

            verifiers = db.query(models.Verifier).all()
            for v in verifiers:
                print(f"\n{v.company_name}: {v.api_key}")

            print("\n" + "=" * 50)
        else:
            print("✅ Database already seeded, skipping.")

    finally:
        db.close()

    return seeded


# Allow running as standalone script
if __name__ == "__main__":
    seed_database()
