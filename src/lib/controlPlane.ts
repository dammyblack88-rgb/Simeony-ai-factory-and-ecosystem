export type IntegrationStatus = {
  id: string;
  name: string;
  state: "available" | "unavailable";
  detail: string;
};

export type HostCapabilities = {
  platform: string;
  python_version: string;
  processor: string;
  cpu_logical_cores: number | null;
  memory_total_bytes: number | null;
  memory_available_bytes: number | null;
  disk_total_bytes: number;
  disk_free_bytes: number;
  cpu_percent?: number;
  memory_percent?: number;
  gpu: {
    status: "not_probed" | "available" | "unavailable";
    message: string;
    devices: string[];
  };
};

export type ControlPlaneSnapshot = {
  health: "online" | "offline" | "checking";
  version?: string;
  checkedAt?: string;
  capabilities?: HostCapabilities;
  integrations: IntegrationStatus[];
  error?: string;
};

const API_BASE = (import.meta.env.VITE_CONTROL_PLANE_URL ?? "").replace(/\/$/, "");

async function requestJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { Accept: "application/json" },
    signal,
  });
  if (!response.ok) throw new Error(`Control plane returned HTTP ${response.status}`);
  return response.json() as Promise<T>;
}

export async function getControlPlaneSnapshot(signal?: AbortSignal): Promise<ControlPlaneSnapshot> {
  const [health, host, integrations] = await Promise.all([
    requestJson<{ status: string; version: string }>("/api/health", signal),
    requestJson<{ capabilities: HostCapabilities }>("/api/v1/system/capabilities", signal),
    requestJson<{ items: IntegrationStatus[] }>("/api/v1/integrations", signal),
  ]);
  if (health.status !== "ok") throw new Error("Control plane health check failed");
  return {
    health: "online",
    version: health.version,
    checkedAt: new Date().toISOString(),
    capabilities: host.capabilities,
    integrations: integrations.items,
  };
}
