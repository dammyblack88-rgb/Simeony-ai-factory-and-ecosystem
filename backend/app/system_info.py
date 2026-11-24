"""Best-effort, real host capability reporting; never fabricates GPU details."""
from __future__ import annotations

import platform
import shutil
from typing import Any

try:
    import psutil
except ImportError:  # pragma: no cover - dependency is declared in requirements
    psutil = None  # type: ignore[assignment]


def get_system_info() -> dict[str, Any]:
    disk = shutil.disk_usage(".")
    info: dict[str, Any] = {
        "platform": platform.platform(),
        "python_version": platform.python_version(),
        "processor": platform.processor() or "Not reported by operating system",
        "cpu_logical_cores": psutil.cpu_count(logical=True) if psutil else None,
        "memory_total_bytes": psutil.virtual_memory().total if psutil else None,
        "memory_available_bytes": psutil.virtual_memory().available if psutil else None,
        "disk_total_bytes": disk.total,
        "disk_free_bytes": disk.free,
        "gpu": {
            "status": "not_probed",
            "message": "GPU detection is not configured yet. No GPU capability is assumed.",
            "devices": [],
        },
    }
    if psutil:
        info["cpu_percent"] = psutil.cpu_percent(interval=0.1)
        info["memory_percent"] = psutil.virtual_memory().percent
    return info
