# Stock Management App

A full-stack stock management application built with Flask, React, and MongoDB.

## Features
- **Authentication**: JWT-based login with Admin/Staff roles.
- **Dashboard**: Stock overview, low stock alerts, recent activity.
- **Product Management**: Add, Edit, Delete products (Admin/Staff).
- **Stock Tracking**: Adjust stock levels, view detailed history.
- **Staff Management**: Admin can create staff accounts.

## Prerequisites
- Python 3.8+
- Node.js 14+
- MongoDB (Local or Atlas)

## Setup

1. **Backend**:
   ```bash
   cd backend
   python -m venv venv
   # Windows
   venv\Scripts\activate
   # Linux/Mac
   source venv/bin/activate
   pip install -r requirements.txt
   ```
   - A `.env` file should be created in `backend/` with `MONGO_URI`.
   - `JWT_SECRET_KEY` should be set for JWT security.

2. **Frontend**:
   ```bash
   cd frontend
   npm install
   ```
   - Create a `.env` file in `frontend/` if you need to point to a production data source:
     ```
     VITE_API_URL=https://your-production-backend.com/api
     ```

## Running the App

Double-click `start_app.bat` or run:

**Backend:**
```bash
cd backend
python app.py
```
(Runs on http://localhost:5000)

**Frontend:**
```bash
cd frontend
npm run dev
```
(Runs on http://localhost:5173 - Access the app here)

Default Admin Credentials:
The app automatically creates a default admin account if none exists.
**Username**: `admin`
**Password**: `admin123`

## Deployment

### Backend (e.g. Render)
1. Push code to GitHub repository.
2. Create a new Web Service on Render.
3. Connect your repository.
4. Set Build Command: `pip install -r requirements.txt`
5. Set Start Command: `gunicorn app:app` (This project includes a `Procfile` for Render).
6. Add Environment Variables: `MONGO_URI` and `JWT_SECRET_KEY`.

### Frontend (e.g. Vercel)
1. Push code to GitHub.
2. Import project in Vercel.
3. Select `Vite` as framework preset.
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Add Environment Variable: `VITE_API_URL` pointing to your deployed backend URL (e.g., `https://my-stock-app.onrender.com/api`).
