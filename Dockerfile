# Stage 1: Build frontend
FROM node:18-slim AS frontend-build

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps

COPY frontend/ .

# Use relative /api path so frontend requests go to same domain
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Stage 2: Backend + serve frontend static files
FROM python:3.9-slim

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

# Copy built frontend into static folder
COPY --from=frontend-build /app/frontend/dist ./static

# Environment variables for Cloud Run
ENV PORT=8080
ENV MONGO_URI=mongodb+srv://Harsha:Harsha@cluster0.22xbuwf.mongodb.net/?appName=Cluster0
ENV JWT_SECRET_KEY=b9e9d6d7e8f9a0b1c2d3e4f5a6b7c8d9

CMD exec gunicorn --bind :$PORT --workers 1 --threads 8 --timeout 0 app:app
