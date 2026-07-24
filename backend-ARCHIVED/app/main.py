from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import models
from .database import engine
from .routers import auth_router, experiences, projects

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Evolv API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # server.ts roda tudo nessa porta hoje
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(experiences.router)
app.include_router(projects.router)


@app.get("/health")
def health():
    return {"status": "ok"}
