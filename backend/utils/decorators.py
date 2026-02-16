from functools import wraps
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
from flask import jsonify
from db import users_col
from bson import ObjectId

def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            verify_jwt_in_request()
            user_id = get_jwt_identity()
            user = users_col.find_one({"_id": ObjectId(user_id)})
            
            if not user or user.get('role') != 'admin':
                return jsonify({"message": "Admin access required"}), 403
            return fn(*args, **kwargs)
        except Exception as e:
            return jsonify({"message": str(e)}), 401
    return wrapper

def staff_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            verify_jwt_in_request()
            user_id = get_jwt_identity()
            user = users_col.find_one({"_id": ObjectId(user_id)})
            
            if not user or (user.get('role') != 'staff' and user.get('role') != 'admin'):
                return jsonify({"message": "Staff access required"}), 403
            return fn(*args, **kwargs)
        except Exception as e:
            return jsonify({"message": str(e)}), 401
    return wrapper
