# Stock Management Web Application

A complete stock management system with role-based access for Admin and Staff.

## 🚀 Features

- **Authentication**: JWT-based secure login.
- **Admin Dashboard**:
  - Staff management (Create staff accounts).
  - Product management (Add new products).
  - Inventory Overview (Total stock summary).
  - Low stock alerts.
- **Staff Dashboard**:
  - Quick stock addition with product search.
  - View current inventory levels.
- **Audit Log**: Full history tracking with date, time, and staff name.
- **Export**: Export history to CSV.
- **Modern UI**: Built with React, Tailwind CSS, and Lucide icons.

---

## 🏗️ Tech Stack

- **Backend**: Flask, MongoDB (Atlas), JWT (Flask-JWT-Extended), Bcrypt.
- **Frontend**: React (Vite), Tailwind CSS, Axios, Lucide React.

---

## 🛠️ Setup Instructions

### 1. Backend Setup
1. Navigate to the `backend` folder.
2. Create a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   source venv/bin/scripts/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure environment variables in `.env`:
   ```env
   MONGO_URI=your_mongodb_atlas_uri
   JWT_SECRET_KEY=your_secret_key
   PORT=5000
   ```
5. Start the server:
   ```bash
   python app.py
   ```
6. **Important**: Create your first admin account:
   ```bash
   python setup_admin.py
   ```

### 2. Frontend Setup
1. Navigate to the `frontend` folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open your browser at `http://localhost:5173`.

---

## 🗂️ Database Schema (MongoDB)

### Users Collection
- `name`: String
- `email`: String (Unique)
- `password`: String (Hashed)
- `role`: String ("admin" or "staff")
- `created_at`: DateTime

### Products Collection
- `product_name`: String
- `current_stock`: Number
- `created_at`: DateTime

### History Collection
- `product_id`: ObjectId reference
- `product_name`: String
- `quantity_added`: Number
- `staff_id`: String
- `staff_name`: String
- `date_time`: DateTime

---

## 🚢 Deployment Steps

### Backend (Render / Cloud Run)
1. Push your code to a GitHub repository.
2. On **Render**:
   - Create a new 'Web Service'.
   - Connect your repo.
   - Set Build Command: `pip install -r requirements.txt`
   - Set Start Command: `gunicorn app:app` (Install gunicorn if needed).
   - Add Environment Variables (MONGO_URI, JWT_SECRET_KEY).

### Frontend (Vercel)
1. On **Vercel**:
   - Create a 'New Project'.
   - Import your repository.
   - Set Framework Preset to 'Vite'.
   - Set Build Command: `npm run build`
   - Set Output Directory: `dist`
   - Deploy!

---

## 🎯 Final Goal Achieved
- Admin manages staff and products.
- Staff adds stock.
- Both see history.
- Everything tracked with date and staff name.
- Clean, modern, and responsive UI.
