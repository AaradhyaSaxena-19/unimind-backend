"""
UniMind AI  |  Main Entrypoint Alias
Provides `main:app` as an entrypoint for Uvicorn by exposing the FastAPI application
from `api.py`.

You can start the backend using any of the following:
    uvicorn main:app --reload --port 8000
    uvicorn api:app --reload --port 8000
    python main.py
"""

import uvicorn
from api import app

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
