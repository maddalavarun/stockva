import bcrypt
from pymongo import MongoClient
import os
from dotenv import load_dotenv
from datetime import datetime

# Load MONGO_URI from .env
load_dotenv()
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/stock_management")

def setup():
    print("--- StockPro Admin Setup (Direct DB) ---")
    try:
        client = MongoClient(MONGO_URI)
        # Explicitly specify the database name
        db = client["stock_management"]
        users_col = db["users"]

        if users_col.count_documents({"role": "admin"}) > 0:
            print("Admin account already exists in the database.")
            return

        name = input("Enter Admin Name: ")
        email = input("Enter Admin Email: ")
        password = input("Enter Admin Password: ")

        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

        users_col.insert_one({
            "name": name,
            "email": email,
            "password": hashed_password,
            "role": "admin",
            "created_at": datetime.utcnow()
        })
        print("\nSuccessfully created admin account in the database!")
        
    except Exception as e:
        print(f"\nFailed to connect to MongoDB: {e}")

if __name__ == "__main__":
    setup()
