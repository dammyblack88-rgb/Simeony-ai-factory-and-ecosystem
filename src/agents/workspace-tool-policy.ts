import { authorizeOperation, type ApprovalDecision } from "./orchestration.ts";

export type WorkspaceCommand = "typecheck" | "test" | "build";
export type WorkspaceToolRequest =
  | { readonly kind: "read_file"; readonly path: string }
  | { readonly kind: "propose_write_file"; readonly path: string; readonly content: string }
  | { readonly kind: "run_check"; readonly command: WorkspaceCommand };
export interface WorkspacePolicyResult {
  readonly allowed: boolean;
  readonly reason: string;
  readonly normalizedPath?: string;
  readonly command?: WorkspaceCommand;
  readonly limits?: Readonly<{ timeoutMs: number; outputCharacters: number }>;
}
const MAX_FILE_CONTENT_CHARACTERS = 100_000;
const MAX_COMMAND_TIMEOUT_MS = 120_000;
const MAX_COMMAND_OUTPUT_CHARACTERS = 20_000;
const READ_BLOCKLIST = /(^|\/)(\.git|node_modules|\.env(?:\.|$)|secrets?)(\/|$)/i;
const WRITE_ROOTS = ["src/", "test/", "tests/", "docs/"];
function normalizeRepositoryPath(path: unknown): string | null {
  if (typeof path !== "string" || path.length === 0 || path.length > 240) return null;
  if (path.startsWith("/") || path.startsWith("~") || path.includes("\\") || path.includes("\0")) return null;
  const parts = path.split("/");
  if (parts.some(part => part === "" || part === "." || part === "..")) return null;
  return parts.join("/");
}
/** Pure policy decision only. This module never reads/writes files or starts processes. */
export function authorizeWorkspaceTool(request: WorkspaceToolRequest, approvals: readonly ApprovalDecision[] = []): WorkspacePolicyResult {
  if (!request || typeof request !== "object" || !("kind" in request)) return { allowed: false, reason: "Malformed workspace tool request." };
  if (request.kind === "read_file") {
    const path = normalizeRepositoryPath(request.path);
    if (!path || READ_BLOCKLIST.test(path)) return { allowed: false, reason: "Path is invalid or belongs to a protected repository area." };
    return { allowed: true, reason: "Read-only repository path accepted by policy.", normalizedPath: path };
  }
  if (request.kind === "propose_write_file") {
    const path = normalizeRepositoryPath(request.path);
    if (!path || READ_BLOCKLIST.test(path) || !WRITE_ROOTS.some(root => path.startsWith(root))) {
      return { allowed: false, reason: "Writes are restricted to src/, test/, tests/ and docs/." };
    }
    if (typeof request.content !== "string" || request.content.length > MAX_FILE_CONTENT_CHARACTERS) {
      return { allowed: false, reason: "File content is invalid or exceeds the 100,000-character limit." };
    }
    const approval = authorizeOperation("repository_write", [...approvals]);
    if (!approval.allowed) return { allowed: false, reason: approval.reason };
    return { allowed: true, reason: "Scoped write proposal accepted; executor must apply it only in an isolated branch.", normalizedPath: path };
  }
  if (request.kind === "run_check") {
    if (!["typecheck", "test", "build"].includes(request.command)) return { allowed: false, reason: "Only fixed typecheck, test and build checks are permitted." };
    const approval = authorizeOperation("command_execution", [...approvals]);
    if (!approval.allowed) return { allowed: false, reason: approval.reason };
    return { allowed: true, reason: "Allowlisted check accepted; no arbitrary command or arguments are supported.", command: request.command, limits: { timeoutMs: MAX_COMMAND_TIMEOUT_MS, outputCharacters: MAX_COMMAND_OUTPUT_CHARACTERS } };
  }
  return { allowed: false, reason: "Unsupported workspace tool operation." };
}
