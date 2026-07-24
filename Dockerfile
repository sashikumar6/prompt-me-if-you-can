# Stage 1 — build React frontend
FROM node:20-slim AS frontend
WORKDIR /build
COPY prompt-me-if-you-can/frontend/package*.json ./
RUN npm ci
COPY prompt-me-if-you-can/frontend/ ./
ARG VITE_API_BASE=""
ENV VITE_API_BASE=$VITE_API_BASE
RUN npm run build

# Stage 2 — Python backend serving the built frontend as static files
FROM python:3.12-slim
WORKDIR /app
COPY prompt-me-if-you-can/backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY prompt-me-if-you-can/backend/ ./
COPY --from=frontend /build/dist ./static
EXPOSE 8000
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
