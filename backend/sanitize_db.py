from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client["stock_management"]
products_col = db["products"]

print("Sanitizing product stock levels...")
for product in products_col.find():
    stock = product.get('current_stock', 0)
    if isinstance(stock, str):
        try:
            new_stock = int(stock)
        except ValueError:
            new_stock = 0
        products_col.update_one({"_id": product["_id"]}, {"$set": {"current_stock": new_stock}})
        print(f"Updated {product.get('product_name')} stock from '{stock}' to {new_stock}")

print("Sanitization complete.")
