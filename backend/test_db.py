import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

uri = os.getenv("MONGO_URI")
print(f"Testing connection to: {uri.split('@')[1] if '@' in uri else 'local'}")

try:
    client = MongoClient(uri)
    # The ismaster command is cheap and does not require auth.
    client.admin.command('ismaster')
    print("MongoDB connection successful!")
    
    db = client.get_database()
    print(f"Connected to database: {db.name}")
    
    # List collections to verify read access + auth
    print("Collections:", db.list_collection_names())
    
except Exception as e:
    print(f"Connection failed: {e}")
