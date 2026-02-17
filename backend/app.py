from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
import os
from datetime import timedelta

# Load environment variables
load_dotenv()

# Check if static frontend files exist (for combined deployment)
static_folder = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static')
has_frontend = os.path.exists(static_folder) and os.path.exists(os.path.join(static_folder, 'index.html'))

if has_frontend:
    app = Flask(__name__, static_folder='static', static_url_path='')
else:
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

if has_frontend:
    @app.route('/')
    def serve_frontend():
        return send_from_directory(app.static_folder, 'index.html')

    @app.errorhandler(404)
    def not_found(e):
        """Serve index.html for SPA routing (React Router)"""
        return send_from_directory(app.static_folder, 'index.html')
else:
    @app.route('/')
    def index():
        return {"message": "Stock Management API is running"}

if __name__ == "__main__":
    app.run(debug=True, port=5000)
