from flask import Flask, jsonify, request
from flask_pymongo import PyMongo
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, get_jwt
from werkzeug.security import generate_password_hash, check_password_hash
from bson.objectid import ObjectId
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Configuration
app.config["MONGO_URI"] = os.getenv("MONGO_URI", "mongodb://localhost:27017/stock_app")
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "super-secret-key")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=12)

mongo = PyMongo(app)
jwt = JWTManager(app)

# --- MODELS & HELPERS ---

def serialize_doc(doc):
    """Convert MongoDB document to JSON serializable format."""
    if not doc:
        return None
    doc["_id"] = str(doc["_id"])
    return doc

# --- AUTH ROUTES ---

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    user = mongo.db.users.find_one({"username": username})

    if not user or not check_password_hash(user['password'], password):
        return jsonify({"msg": "Invalid credentials"}), 401
    
    # Subject must be a string (user_id), other info in additional_claims
    input_identity = str(user['_id'])
    additional_claims = {"username": username, "role": user['role']}
    
    access_token = create_access_token(identity=input_identity, additional_claims=additional_claims)
    return jsonify(access_token=access_token, role=user['role'], username=username)

@app.route('/api/auth/register-staff', methods=['POST'])
@jwt_required()
def register_staff():
    try:
        claims = get_jwt()
        if claims.get('role') != 'admin':
            return jsonify({"msg": "Admins only"}), 403

        data = request.json
        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            return jsonify({"msg": "Username and password required"}), 400

        if mongo.db.users.find_one({"username": username}):
            return jsonify({"msg": "User already exists"}), 400

        hashed_password = generate_password_hash(password)
        mongo.db.users.insert_one({
            "username": username,
            "password": hashed_password,
            "role": "staff",
            "created_at": datetime.utcnow()
        })
        return jsonify({"msg": "Staff created successfully"}), 201
    except Exception as e:
        print(f"Error creating staff: {e}")
        return jsonify({"msg": f"Server error: {str(e)}"}), 500

# --- PRODUCT ROUTES ---

@app.route('/api/products', methods=['GET'])
@jwt_required()
def get_products():
    products = list(mongo.db.products.find().sort("created_at", -1))
    return jsonify([serialize_doc(p) for p in products])

@app.route('/api/products', methods=['POST'])
@jwt_required()
def add_product():
    data = request.json
    # Validation could be added here
    new_product = {
        "name": data.get('name'),
        "category": data.get('category'),
        "price": float(data.get('price')),
        "stock_quantity": int(data.get('stockQuantity', 0)),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    result = mongo.db.products.insert_one(new_product)
    
    # Log detailed history
    log_history(
        action="create",
        product_id=str(result.inserted_id),
        product_name=new_product['name'],
        quantity=new_product['stock_quantity'],
        user=get_jwt()['username']
    )
    
    return jsonify({"msg": "Product added", "id": str(result.inserted_id)}), 201

@app.route('/api/products/<id>', methods=['PUT'])
@jwt_required()
def update_product(id):
    data = request.json
    claims = get_jwt()
    current_username = claims['username']
    
    # Check if stock is being modified separately for history logging
    old_product = mongo.db.products.find_one({"_id": ObjectId(id)})
    if not old_product:
        return jsonify({"msg": "Product not found"}), 404

    update_data = {
        "name": data.get('name', old_product['name']),
        "category": data.get('category', old_product['category']),
        "price": float(data.get('price', old_product['price'])),
        "updated_at": datetime.utcnow()
    }
    
    # If stock is explicitly updated (e.g. "Add Stock" feature vs "Edit Product")
    if 'stockQuantity' in data:
        new_quantity = int(data.get('stockQuantity'))
        update_data['stock_quantity'] = new_quantity
        
        # Calculate difference for history
        diff = new_quantity - old_product['stock_quantity']
        if diff != 0:
            log_history(
                action="update_stock", 
                product_id=id, 
                product_name=old_product['name'], 
                quantity=diff, 
                user=current_username
            )
    else:
        # Generic update logging
        log_history(
            action="edit_details",
            product_id=id,
            product_name=old_product['name'],
            quantity=0,
            user=current_username
        )

    mongo.db.products.update_one({"_id": ObjectId(id)}, {"$set": update_data})
    return jsonify({"msg": "Product updated"}), 200

@app.route('/api/products/<id>', methods=['DELETE'])
@jwt_required()
def delete_product(id):
    product = mongo.db.products.find_one({"_id": ObjectId(id)})
    if product:
        log_history("delete", id, product['name'], 0, get_jwt()['username'])
        mongo.db.products.delete_one({"_id": ObjectId(id)})
        return jsonify({"msg": "Product deleted"}), 200
    return jsonify({"msg": "Product not found"}), 404

# --- STOCK HISTORY ROUTES ---

def log_history(action, product_id, product_name, quantity, user):
    mongo.db.history.insert_one({
        "action": action,
        "product_id": product_id,
        "product_name": product_name,
        "quantity_change": quantity,
        "staff_name": user,
        "timestamp": datetime.utcnow()
    })

@app.route('/api/history', methods=['GET'])
@jwt_required()
def get_history():
    history = list(mongo.db.history.find().sort("timestamp", -1).limit(100))
    return jsonify([serialize_doc(h) for h in history])

@app.route('/api/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard_stats():
    total_products = mongo.db.products.count_documents({})
    low_stock = mongo.db.products.count_documents({"stock_quantity": {"$lt": 10}}) # Alert threshold 10
    recent_history = list(mongo.db.history.find({"action": "update_stock"}).sort("timestamp", -1).limit(5))
    
    return jsonify({
        "total_products": total_products,
        "low_stock_count": low_stock,
        "recent_stock_activity": [serialize_doc(h) for h in recent_history]
    })


# --- SETUP ---

@app.route('/')
def home():
    return "Stock Management API is running!"

# Helper to create initial admin if not exists
def create_initial_admin():
    if not mongo.db.users.find_one({"role": "admin"}):
        hashed_password = generate_password_hash("admin123") # Default password
        mongo.db.users.insert_one({
            "username": "admin",
            "password": hashed_password,
            "role": "admin",
            "created_at": datetime.utcnow()
        })
        print("Initial admin created: admin / admin123")

if __name__ == '__main__':
    with app.app_context():
        create_initial_admin()
    app.run(debug=True, port=5000, host='0.0.0.0')
