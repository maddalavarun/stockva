from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
import os
from datetime import timedelta

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Configuration
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "super-secret-key")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=24)
app.config["MONGO_URI"] = os.getenv("MONGO_URI", "mongodb://localhost:27017/stock_management")

jwt = JWTManager(app)

# Register Blueprints
from routes.auth_routes import auth_bp
from routes.admin_routes import admin_bp
from routes.staff_routes import staff_bp
from routes.common_routes import common_bp

app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(admin_bp, url_prefix='/api/admin')
app.register_blueprint(staff_bp, url_prefix='/api/staff')
app.register_blueprint(common_bp, url_prefix='/api/common')

@app.route('/')
def index():
    return {"message": "Stock Management API is running"}

if __name__ == "__main__":
    app.run(debug=True, port=5000)
