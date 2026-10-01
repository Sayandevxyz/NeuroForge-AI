from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.session import init_db, async_session_maker
from app.services.seed_service import seed_database

# Routers
from app.api.research import router as research_router
from app.api.experiments import router as experiments_router
from app.api.gpu import router as gpu_router
from app.api.models import router as models_router
from app.api.datasets import router as datasets_router
from app.api.benchmarks import router as benchmarks_router
from app.api.reports import router as reports_router
from app.api.genome import router as genome_router
from app.api.settings_router import router as settings_router
from app.api.ws import ws_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB schema
    await init_db()
    # Seed realistic demo research run NF-027 and catalog
    async with async_session_maker() as session:
        await seed_database(session)
    print("[NeuroForge AI API] Database initialized & seeded successfully.")
    yield


app = FastAPI(
    title=settings.APP_NAME,
    description="Autonomous AI Research & Experimentation Lab API",
    version=settings.VERSION,
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(research_router)
app.include_router(experiments_router)
app.include_router(gpu_router)
app.include_router(models_router)
app.include_router(datasets_router)
app.include_router(benchmarks_router)
app.include_router(reports_router)
app.include_router(genome_router)
app.include_router(settings_router)
app.include_router(ws_router)


@app.get("/")
async def root():
    return {
        "name": settings.APP_NAME,
        "tagline": "Autonomous AI Research & Experimentation Lab",
        "version": settings.VERSION,
        "demo_mode": settings.DEMO_MODE,
        "status": "operational",
        "cluster": "Nebius Cloud (NVIDIA H100 SXM5)" if not settings.DEMO_MODE else "Nebius Cloud (Simulated H100 Pool)"
    }


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "demo_mode": settings.DEMO_MODE,
        "gpu_provider": settings.GPU_PROVIDER,
        "nvidia_backend": settings.NVIDIA_BACKEND
    }
