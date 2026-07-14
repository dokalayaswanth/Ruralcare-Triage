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

@app.get("/")
async def root():
    return {
        "message": "Welcome to the RuralcareTriage Backend API!"
    }

app.include_router(records.router)
app.include_router(triage.router)
app.include_router(audit.router)
app.include_router(rag.router)