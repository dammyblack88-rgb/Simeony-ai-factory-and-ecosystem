"""SIMEONY local-first control plane API."""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .integrations import get_integrations
from .system_info import get_system_info

app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    description="Local-first control plane for SIMEONY production tools and workers.",
)

# Local development origins only. LAN exposure is an explicit opt-in and still
# requires a future authenticated gateway before this service is internet-facing.
allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
]
if settings.enable_lan:
    allowed_origins.extend(["http://localhost", "http://127.0.0.1"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["GET"],
    allow_headers=["Accept", "Content-Type"],
)


@app.get("/api/health", tags=["system"])
async def health() -> dict[str, Any]:
    return {
        "status": "ok",
        "service": "simeony-control-plane",
        "version": settings.version,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/api/v1/system/capabilities", tags=["system"])
async def capabilities() -> dict[str, Any]:
    return {"source": "local-host", "capabilities": get_system_info()}


@app.get("/api/v1/integrations", tags=["integrations"])
async def integrations() -> dict[str, Any]:
    results = await get_integrations()
    return {
        "items": results,
        "summary": {
            "available": sum(item["state"] == "available" for item in results),
            "configured": len(results),
        },
    }


@app.get("/api/v1/overview", tags=["system"])
async def overview() -> dict[str, Any]:
    integration_results = await get_integrations()
    return {
        "health": "ok",
        "service": "simeony-control-plane",
        "version": settings.version,
        "capabilities": get_system_info(),
        "integrations": integration_results,
    }
