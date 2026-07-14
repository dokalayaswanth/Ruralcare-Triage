# RuralCare Triage

RuralCare Triage is an AI-powered clinical triage assistant designed for rural healthcare settings. The application collects patient symptoms, retrieves relevant clinical guidance using RAG, generates a structured triage recommendation, and surfaces cases to a specialist review workflow.

> This project is built for educational and portfolio purposes. It is not a replacement for professional medical judgment, diagnosis, or emergency care.

## Features

- Patient symptom intake workflow
- Optional vitals collection
- AI-assisted triage classification
- Urgency tiers: ROUTINE, URGENT, EMERGENCY
- Supabase Cloud database integration
- Audit log for AI and clinician actions
- Specialist review flow
- Clinician override and resolve endpoints
- RAG-ready backend using FAISS and local clinical guideline text files
- Groq LLM integration planned for structured triage reasoning

## Tech Stack

### Backend
- FastAPI
- Python
- Pydantic
- Supabase Python Client
- LangChain
- FAISS
- sentence-transformers
- Groq API

### Database
- Supabase PostgreSQL
- Supabase Auth
- Row-Level Security
- Supabase Realtime-ready schema

### Frontend
- Next.js
- TypeScript
- TailwindCSS
- shadcn/ui
- Supabase client

## Project Structure

```text
ruralcare-triage/
├── backend/
│   ├── main.py
│   ├── routers/
│   │   ├── cases.py
│   │   ├── triage.py
│   │   ├── audit.py
│   │   └── rag.py
│   ├── services/
│   │   ├── supabase_client.py
│   │   ├── triage_service.py
│   │   └── rag_service.py
│   ├── models/
│   │   └── schemas.py
│   ├── data/
│   │   └── knowledge_base/
│   ├── scripts/
│   │   └── build_index.py
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   └── ...
│
└── README.md