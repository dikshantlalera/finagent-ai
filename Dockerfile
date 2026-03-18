FROM python:3.11

# Install Node.js for building the React frontend
RUN apt-get update && apt-get install -y curl \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install and build Frontend
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install --no-package-lock --legacy-peer-deps
COPY frontend/ ./frontend/
RUN cd frontend && npm run build

# Install Backend dependencies
COPY backend/requirements.txt ./backend/
RUN cd backend && pip install --no-cache-dir -r requirements.txt

# Copy the rest of the Backend code
COPY backend/ ./backend/

# Start the FastAPI server
# We must cd into backend so that local imports (like pdf_extractor) work correctly
CMD sh -c "cd backend && uvicorn main:app --host 0.0.0.0 --port ${PORT:-8080}"
