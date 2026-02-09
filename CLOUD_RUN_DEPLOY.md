# Deploying to Google Cloud Run

You will deploy two separate services: one for the Backend (Flask) and one for the Frontend (React).

## Prerequisites
1.  **Google Cloud SDK** installed and initialized (`gcloud init`).
2.  **Docker** installed (optional, but good for local testing).
3.  **MongoDB Atlas** accessible from anywhere (0.0.0.0/0 whitelist in Network Access).

## 1. Backend Deployment

1.  Navigate to backend: `cd backend`
2.  Build and push image:
    ```bash
    gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/stock-backend
    ```
3.  Deploy to Cloud Run:
    ```bash
    gcloud run deploy stock-backend \
      --image gcr.io/YOUR_PROJECT_ID/stock-backend \
      --platform managed \
      --allow-unauthenticated \
      --set-env-vars MONGO_URI="YOUR_MONGODB_URI",JWT_SECRET_KEY="YOUR_SECRET"
    ```
4.  **Copy the Backend URL** provided in the output (e.g., `https://stock-backend-xyz.a.run.app`).

## 2. Frontend Deployment

1.  Navigate to frontend: `cd frontend`
2.  Update API URL:
    *   Open `frontend/Dockerfile`? No, build args are tricky with static files.
    *   **Easier way**: Create a `.env.production` file in `frontend/`:
        ```
        VITE_API_URL=https://stock-backend-xyz.a.run.app/api
        ```
        *(Replace with your actual Backend URL from step 1)*
3.  Build and push image:
    ```bash
    gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/stock-frontend
    ```
4.  Deploy to Cloud Run:
    ```bash
    gcloud run deploy stock-frontend \
      --image gcr.io/YOUR_PROJECT_ID/stock-frontend \
      --platform managed \
      --allow-unauthenticated
    ```
5.  **Access your App**: Click the URL provided for the frontend service!

## Important Notes

*   **MongoDB Access**: Ensure your MongoDB Atlas Network Access allows connections from "Anywhere" (0.0.0.0/0) because Cloud Run IPs change.
*   **CORS**: If you face CORS issues, update `app.py` in backend to allow your specific frontend URL:
    `CORS(app, resources={r"/api/*": {"origins": "https://stock-frontend-xyz.a.run.app"}})`
