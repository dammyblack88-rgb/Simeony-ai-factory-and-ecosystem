"""Probe configured local engines with short timeouts and honest states."""
from __future__ import annotations

import asyncio
from typing import Any
from urllib.error import URLError
from urllib.request import Request, urlopen

from .config import settings


def _probe(url: str, path: str = "/") -> tuple[str, str]:
    try:
        request = Request(url.rstrip("/") + path, headers={"User-Agent": "SIMEONY-Control-Plane/0.1"})
        with urlopen(request, timeout=1.5) as response:
            if 200 <= response.status < 300:
                return "available", f"HTTP {response.status}"
            return "unavailable", f"HTTP {response.status}"
    except (URLError, TimeoutError, OSError) as exc:
        return "unavailable", str(exc)[:180]


async def _check(name: str, base_url: str, path: str = "/") -> dict[str, Any]:
    state, detail = await asyncio.to_thread(_probe, base_url, path)
    return {"id": name, "name": name, "state": state, "base_url": base_url, "detail": detail}


async def get_integrations() -> list[dict[str, Any]]:
    return await asyncio.gather(
        _check("Ollama", settings.ollama_url, "/api/tags"),
        _check("ComfyUI", settings.comfyui_url, "/"),
    )
