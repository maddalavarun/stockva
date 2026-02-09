@echo off
echo Starting Backend...
start "Backend" cmd /k "cd backend && venv\Scripts\activate && python app.py"
echo Starting Frontend...
start "Frontend" cmd /k "cd frontend && npm run dev -- --host"
echo Application started!
echo Access on PC: http://localhost:5173
echo Access on Mobile: http://192.168.1.39:5173
echo (Make sure your phone is on the same WiFi)
