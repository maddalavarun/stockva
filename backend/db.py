from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/stock_management")
client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
# Use specific DB name
db = client["stock_management"]

# Collections
users_col = db["users"]
products_col = db["products"]
history_col = db["history"]
