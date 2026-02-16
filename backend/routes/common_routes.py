from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from db import products_col, history_col
from bson import ObjectId
from datetime import datetime, timezone, timedelta

common_bp = Blueprint('common', __name__)

@common_bp.route('/products', methods=['GET'])
@jwt_required()
def get_products():
    products = list(products_col.find())
    for p in products:
        p['_id'] = str(p['_id'])
    return jsonify(products), 200

@common_bp.route('/history', methods=['GET'])
@jwt_required()
def get_history():
    # Optional filtering by date or search
    search = request.args.get('search', '')
    filter_date = request.args.get('date', '') # Expects YYYY-MM-DD
    query = {}
    
    if search:
        query["product_name"] = {"$regex": search, "$options": "i"}
    
    if filter_date:
        try:
            # Create IST date range for the requested date
            ist_offset = timezone(timedelta(hours=5, minutes=30))
            start_of_day = datetime.strptime(filter_date, '%Y-%m-%d').replace(tzinfo=ist_offset)
            end_of_day = start_of_day + timedelta(days=1)
            
            query["date_time"] = {
                "$gte": start_of_day,
                "$lt": end_of_day
            }
        except ValueError:
            pass # Ignore invalid date format

    history = list(history_col.find(query).sort("date_time", -1))
    for h in history:
        h['_id'] = str(h['_id'])
        # If it's a naive datetime (stored previously), assume it was UTC and convert
        if h['date_time'].tzinfo is None:
            # Shift old naive UTC entries to IST for display consistency
            h['date_time'] = h['date_time'].replace(tzinfo=timezone.utc).astimezone(timezone(timedelta(hours=5, minutes=30)))
        h['date_time'] = h['date_time'].isoformat()
    return jsonify(history), 200

@common_bp.route('/stock-summary', methods=['GET'])
@jwt_required()
def get_stock_summary():
    # Similar to products but maybe just a list of items and counts
    products = list(products_col.find({}, {"product_name": 1, "current_stock": 1}))
    for p in products:
        p['_id'] = str(p['_id'])
    return jsonify(products), 200
