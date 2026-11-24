"""Environment-backed configuration for the SIMEONY local control plane."""
from __future__ import annotations

import os
from dataclasses import dataclass


def _env_bool(name: str, default: bool = False) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


@dataclass(frozen=True)
class Settings:
    app_name: str = "SIMEONY Local Control Plane"
    version: str = "0.1.0"
    host: str = os.getenv("SIMEONY_HOST", "127.0.0.1")
    port: int = int(os.getenv("SIMEONY_PORT", "8765"))
    ollama_url: str = os.getenv("SIMEONY_OLLAMA_URL", "http://127.0.0.1:11434")
    comfyui_url: str = os.getenv("SIMEONY_COMFYUI_URL", "http://127.0.0.1:8188")
    enable_lan: bool = _env_bool("SIMEONY_ENABLE_LAN", False)


settings = Settings()
