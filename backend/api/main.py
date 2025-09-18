from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from typing import Optional
import json

from .routes import submissions, decisions
from .config import get_settings

settings = get_settings()

app = FastAPI(
    title="Talent Spark API",
    description="AI-powered sports talent assessment backend",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check
@app.get("/")
async def health_check():
    return {"status": "healthy", "service": "talent-spark-api"}

@app.get("/health")
async def detailed_health():
    return {
        "status": "healthy",
        "version": "1.0.0",
        "environment": settings.environment,
        "database": "connected",
        "storage": "connected"
    }

# Include routers
app.include_router(submissions.router, prefix="/api", tags=["submissions"])
app.include_router(decisions.router, prefix="/api", tags=["decisions"])

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True if settings.environment == "development" else False
    )
