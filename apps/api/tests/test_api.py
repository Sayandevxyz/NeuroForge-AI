import pytest
import httpx
from app.main import app


@pytest.mark.asyncio
async def test_health_and_root():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        res = await client.get("/health")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "healthy"
        assert "demo_mode" in data


@pytest.mark.asyncio
async def test_research_runs_list():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        # Trigger startup
        async with app.router.lifespan_context(app):
            res = await client.get("/api/research")
            assert res.status_code == 200
            runs = res.json()
            assert len(runs) >= 1
            assert runs[0]["run_code"] == "NF-027"


@pytest.mark.asyncio
async def test_experiments_list():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        async with app.router.lifespan_context(app):
            res = await client.get("/api/experiments")
            assert res.status_code == 200
            exps = res.json()
            assert len(exps) == 12
            champion = next((e for e in exps if e["is_best_run"]), None)
            assert champion is not None
            assert champion["accuracy"] == 87.4


@pytest.mark.asyncio
async def test_gpu_status():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        res = await client.get("/api/gpu/status")
        assert res.status_code == 200
        data = res.json()
        assert "provider" in data
        assert len(data["live_nodes"]) > 0


@pytest.mark.asyncio
async def test_experiment_genome():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        async with app.router.lifespan_context(app):
            res = await client.get("/api/genome/NF-027")
            assert res.status_code == 200
            genome = res.json()
            assert len(genome["nodes"]) == 12
            assert len(genome["edges"]) >= 7


@pytest.mark.asyncio
async def test_create_research_run():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        async with app.router.lifespan_context(app):
            res = await client.post("/api/research", json={
                "goal": "Optimize a 7B model for mathematical reasoning with low latency",
                "optimization_target": "balanced",
                "gpu_budget_hours": 50.0,
                "experiment_budget_max": 4
            })
            assert res.status_code == 200
            created = res.json()
            assert "run_code" in created
            assert created["status"] == "queued"
