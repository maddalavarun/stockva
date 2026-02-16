from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
import bcrypt
from db import users_col
from datetime import datetime, timezone, timedelta

ist = timezone(timedelta(hours=5, minutes=30))

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = users_col.find_one({"email": email})
    if user and bcrypt.checkpw(password.encode('utf-8'), user['password']):
        access_token = create_access_token(identity=str(user['_id']))
        return jsonify({
            "access_token": access_token,
            "user": {
                "name": user['name'],
                "email": user['email'],
                "role": user['role']
            }
        }), 200
    
    return jsonify({"message": "Invalid credentials"}), 401

# For initial setup, we might need a way to create the first admin
@auth_bp.route('/setup-admin', methods=['POST'])
def setup_admin():
    if users_col.count_documents({"role": "admin"}) > 0:
        return jsonify({"message": "Admin already exists"}), 400
    
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    users_col.insert_one({
        "name": name,
        "email": email,
        "password": hashed_password,
        "role": "admin",
        "created_at": datetime.now(ist)
    })

    return jsonify({"message": "Admin created successfully"}), 201
