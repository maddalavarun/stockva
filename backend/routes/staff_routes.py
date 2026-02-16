from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity
from db import products_col, history_col, users_col
from utils.decorators import staff_required
from datetime import datetime, timezone, timedelta
from bson import ObjectId

ist = timezone(timedelta(hours=5, minutes=30))

staff_bp = Blueprint('staff', __name__)

@staff_bp.route('/add-stock', methods=['POST'])
@staff_required
def add_stock():
    data = request.get_json()
    product_id = data.get('product_id')
    quantity = data.get('quantity')
    
    user_id = get_jwt_identity()
    user = users_col.find_one({"_id": ObjectId(user_id)})
    if not user:
        return jsonify({"message": "User not found"}), 404
        
    staff_name = user['name']

    product = products_col.find_one({"_id": ObjectId(product_id)})
    if not product:
        return jsonify({"message": "Product not found"}), 404

    # Update product stock
    products_col.update_one(
        {"_id": ObjectId(product_id)},
        {"$inc": {"current_stock": int(quantity)}}
    )

    # Save to history
    history_col.insert_one({
        "product_id": str(product_id),
        "product_name": product['product_name'],
        "quantity_added": int(quantity),
        "staff_id": str(user_id),
        "staff_name": staff_name,
        "date_time": datetime.now(ist)
    })

    return jsonify({"message": "Stock updated successfully"}), 200

# Some applications might want bulk update, but the prompt says "Enter quantity for each product"
# I'll stick to single product update for simplicity or a bulk one if it makes sense.
# The prompt says "Submit stock update" after seeing list of products.
# Let's add a bulk update route just in case the UI is a form with multiple rows.

@staff_bp.route('/bulk-add-stock', methods=['POST'])
@staff_required
def bulk_add_stock():
    data = request.get_json() # List of {product_id, quantity}
    updates = data.get('updates', [])
    
    user_id = get_jwt_identity()
    user = users_col.find_one({"_id": ObjectId(user_id)})
    if not user:
        return jsonify({"message": "User not found"}), 404
        
    staff_name = user['name']
    timestamp = datetime.now(ist)

    for up in updates:
        pid = up.get('product_id')
        qty = int(up.get('quantity', 0))
        if qty <= 0: continue

        product = products_col.find_one({"_id": ObjectId(pid)})
        if product:
            products_col.update_one(
                {"_id": ObjectId(pid)},
                {"$inc": {"current_stock": qty}}
            )
            history_col.insert_one({
                "product_id": str(pid),
                "product_name": product['product_name'],
                "quantity_added": qty,
                "staff_id": str(user_id),
                "staff_name": staff_name,
                "date_time": timestamp
            })

    return jsonify({"message": "Bulk stock update successful"}), 200
