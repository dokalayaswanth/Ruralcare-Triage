import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import records, triage, audit, rag

load_dotenv()

app = FastAPI(
    title="RuralcareTriage Backend",
    description="Backend API for AI-powered rural healthcare triage",
    version="1.0.0",
)

allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    os.getenv("FRONTEND_URL", "http://localhost:3000"),
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(set(allowed_origins)),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "Welcome to the RuralcareTriage Backend API!"
    }
@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "message": "RuralcareTriage Backend API is running smoothly."
    }
app.include_router(records.router)
app.include_router(triage.router)
app.include_router(audit.router)
app.include_router(rag.router)