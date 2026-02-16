from flask import Blueprint, request, jsonify
import bcrypt
from db import users_col, products_col, history_col
from utils.decorators import admin_required
from datetime import datetime, timezone, timedelta
from bson import ObjectId

ist = timezone(timedelta(hours=5, minutes=30))

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/create-staff', methods=['POST'])
@admin_required
def create_staff():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    if users_col.find_one({"email": email}):
        return jsonify({"message": "User already exists"}), 400

    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    users_col.insert_one({
        "name": name,
        "email": email,
        "password": hashed_password,
        "role": "staff",
        "created_at": datetime.now(ist)
    })

    return jsonify({"message": "Staff account created"}), 201

@admin_bp.route('/add-product', methods=['POST'])
@admin_required
def add_product():
    data = request.get_json()
    product_name = data.get('product_name')
    print(f"DEBUG: Adding product: {product_name} with data {data}")
    # Ensure it's stored as an integer
    try:
        initial_stock = int(data.get('initial_stock', 0))
    except (ValueError, TypeError):
        initial_stock = 0

    res = products_col.insert_one({
        "product_name": product_name,
        "current_stock": initial_stock,
        "created_at": datetime.now(ist)
    })
    print(f"DEBUG: Product added with ID: {res.inserted_id}")

    return jsonify({"message": "Product added successfully"}), 201

@admin_bp.route('/staff', methods=['GET'])
@admin_required
def get_staff():
    staff_members = list(users_col.find({"role": "staff"}, {"password": 0}))
    for s in staff_members:
        s['_id'] = str(s['_id'])
    return jsonify(staff_members), 200

@admin_bp.route('/dashboard-summary', methods=['GET'])
@admin_required
def get_summary():
    # Calculate Today's boundaries in IST
    now = datetime.now(ist)
    start_of_today = now.replace(hour=0, minute=0, second=0, microsecond=0)
    
    # Today's new products
    today_products = products_col.count_documents({
        "created_at": {"$gte": start_of_today}
    })
    
    # Today's new staff
    today_staff = users_col.count_documents({
        "role": "staff",
        "created_at": {"$gte": start_of_today}
    })
    
    # Today's stock additions (from history)
    pipeline = [
        {"$match": {"date_time": {"$gte": start_of_today}}},
        {"$group": {"_id": None, "total": {"$sum": "$quantity_added"}}}
    ]
    stock_res = list(history_col.aggregate(pipeline))
    today_stock_added = stock_res[0]['total'] if stock_res else 0

    return jsonify({
        "today_products": today_products,
        "today_staff": today_staff,
        "today_stock_added": today_stock_added
    }), 200
