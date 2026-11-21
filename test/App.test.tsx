import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "../src/App";

const STORAGE_KEY = "simeony.workspace.v1";

beforeEach(() => {
  window.localStorage.clear();
  vi.restoreAllMocks();
});

async function createProject(description: string) {
  const user = userEvent.setup();
  let idea = screen.queryByPlaceholderText(/I want to build/i);
  if (!idea) {
    await user.click(screen.getByRole("button", { name: "New project" }));
    idea = screen.getByPlaceholderText(/I want to build/i);
  }
  if (!idea) throw new Error("Project prompt was not found");
  await user.clear(idea);
  await user.type(idea, description);
  await user.click(screen.getByRole("button", { name: /create project/i }));
}

describe("SIMEONY Studio", () => {
  it("renders the overview and navigates to existing screens", async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByText(/Good (morning|afternoon|evening),/i)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "AI workspace" }));
    expect(screen.getByText(/THE SIMEONY CREATION ENGINE/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Creation engines" }));
    expect(screen.getByRole("heading", { name: "Creation engines" })).toBeInTheDocument();
  });

  it("creates and classifies a project", async () => {
    render(<App />);
    await createProject("Build a mobile app for field service teams");

    expect(screen.getByRole("heading", { name: "Build a mobile app for field service teams" })).toBeInTheDocument();
    expect(screen.getByText("Mobile application")).toBeInTheDocument();
    expect(screen.getByText("Planning")).toBeInTheDocument();
  });

  it("filters projects by name or kind", async () => {
    const user = userEvent.setup();
    render(<App />);
    await createProject("Build a web dashboard");
    await user.click(screen.getByRole("button", { name: /All projects/i }));
    await createProject("Build a mobile field app");
    await user.click(screen.getByRole("button", { name: /All projects/i }));

    const filter = screen.getByRole("textbox", { name: "Filter projects" });
    await user.type(filter, "mobile");
    expect(screen.getByText("Build a mobile field app")).toBeInTheDocument();
    expect(screen.queryByText("Build a web dashboard")).not.toBeInTheDocument();
  });

  it("updates task status and project progress", async () => {
    const user = userEvent.setup();
    render(<App />);
    await createProject("Create a product platform");

    const firstTask = screen.getAllByRole("checkbox")[0];
    await user.click(firstTask);
    expect(firstTask).toBeChecked();
    expect(screen.getByText("20%")).toBeInTheDocument();
  });

  it("adds a validated task title", async () => {
    const user = userEvent.setup();
    render(<App />);
    await createProject("Create a product platform");

    const input = screen.getByRole("textbox", { name: "New task" });
    await user.type(input, "Prepare the launch checklist");
    await user.click(screen.getByRole("button", { name: "Add task" }));

    expect(screen.getByText("Prepare the launch checklist")).toBeInTheDocument();
  });

  it("deletes a project only after confirmation", async () => {
    const user = userEvent.setup();
    render(<App />);
    await createProject("Temporary website");

    vi.spyOn(window, "confirm").mockReturnValue(false);
    await user.click(screen.getByRole("button", { name: "Delete project" }));
    expect(screen.getByRole("heading", { name: "Temporary website" })).toBeInTheDocument();

    vi.spyOn(window, "confirm").mockReturnValue(true);
    await user.click(screen.getByRole("button", { name: "Delete project" }));
    expect(screen.getByText("No projects yet")).toBeInTheDocument();
  });

  it("persists valid projects in browser storage", async () => {
    render(<App />);
    await createProject("Persistent web application");

    await waitFor(() => {
      const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
      expect(saved).toHaveLength(1);
      expect(saved[0].name).toBe("Persistent web application");
    });

    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    expect(saved[0].tasks).toHaveLength(5);
  });

  it("preserves malformed localStorage instead of overwriting it", () => {
    window.localStorage.setItem(STORAGE_KEY, "{broken");
    render(<App />);

    expect(screen.getByRole("status")).toHaveTextContent("original browser data was preserved");
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe("{broken");
  });

  it("recovers valid entries and preserves malformed array entries", async () => {
    const original = JSON.stringify([
      { id: "valid-1", name: "Recovered project", description: "Recovered", kind: "Web application", status: "Planning", updated: "Recently", createdAt: "2026-01-01T00:00:00.000Z", mode: "Simple", icon: "web", tasks: [], activity: [] },
      null,
    ]);
    window.localStorage.setItem(STORAGE_KEY, original);
    render(<App />);

    expect(screen.getByText(/Valid projects were recovered/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Recovered projectPlanning · 0% complete/i })).toBeInTheDocument();
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe(original);
  });

  it("requires explicit recovery confirmation and preserves an exact backup", async () => {
    const user = userEvent.setup();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([
      { id: "valid-1", name: "Recovered project", description: "Recovered", kind: "Web application", status: "Planning", updated: "Recently", createdAt: "2026-01-01T00:00:00.000Z", mode: "Simple", icon: "web", tasks: [], activity: [] },
      null,
    ]));
    const original = window.localStorage.getItem(STORAGE_KEY);
    render(<App />);

    vi.spyOn(window, "confirm").mockReturnValue(true);
    await user.click(screen.getByRole("button", { name: "Recover and save" }));

    expect(window.localStorage.getItem("simeony.workspace.recovery-backup.v1")).toBe(original);
    const recovered = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    expect(recovered).toHaveLength(1);
    expect(recovered[0].id).toBe("valid-1");
    expect(recovered[0].name).toBe("Recovered project");
    expect(screen.getByRole("status")).toHaveTextContent("Recovery completed");
  });

  it("does not claim persistence before recovery confirmation", async () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([
      { id: "valid-1", name: "Recovered project", description: "Recovered", kind: "Web application", status: "Planning", updated: "Recently", createdAt: "2026-01-01T00:00:00.000Z", mode: "Simple", icon: "web", tasks: [], activity: [] },
      null,
    ]));
    render(<App />);

    await createProject("Unsaved recovery project");
    expect(screen.getByRole("status")).toHaveTextContent("memory only");
  });

  it("creates, edits and deletes projects normally after successful recovery", async () => {
    const user = userEvent.setup();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([
      { id: "valid-1", name: "Recovered project", description: "Recovered", kind: "Web application", status: "Planning", updated: "Recently", createdAt: "2026-01-01T00:00:00.000Z", mode: "Simple", icon: "web", tasks: [], activity: [] },
      null,
    ]));
    render(<App />);

    vi.spyOn(window, "confirm").mockReturnValue(true);
    await user.click(screen.getByRole("button", { name: "Recover and save" }));
    await createProject("New project after recovery");

    await waitFor(() => {
      const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
      expect(saved.some((project: { name: string }) => project.name === "New project after recovery")).toBe(true);
    });

    await user.click(screen.getAllByRole("checkbox")[0]);
    expect(screen.getByText("20%")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Delete project" }));
    await waitFor(() => {
      expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]")).toHaveLength(1);
    });
  });

  it("reloads projects previously persisted by recovery", async () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([
      { id: "saved-1", name: "Persisted project", description: "Saved", kind: "Web application", status: "Planning", updated: "Recently", createdAt: "2026-01-01T00:00:00.000Z", mode: "Simple", icon: "web", tasks: [], activity: [] },
    ]));
    const first = render(<App />);
    expect(screen.getByText("Persisted project")).toBeInTheDocument();
    first.unmount();

    render(<App />);
    expect(screen.getByText("Persisted project")).toBeInTheDocument();
  });

  it("rejects task titles longer than the limit", async () => {
    render(<App />);
    await createProject("Create a product platform");

    fireEvent.change(screen.getByRole("textbox", { name: "New task" }), { target: { value: "x".repeat(181) } });
    fireEvent.click(screen.getByRole("button", { name: "Add task" }));
    expect(screen.getByRole("status")).toHaveTextContent("180 characters or fewer");
  });

  it("quarantines duplicate project and task IDs", async () => {
    const user = userEvent.setup();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([
      { id: "same-project", name: "First valid project", description: "First", kind: "Web application", status: "Planning", updated: "Recently", createdAt: "2026-01-01T00:00:00.000Z", mode: "Simple", icon: "web", tasks: [{ id: "same-task", title: "One", done: false }, { id: "same-task", title: "Two", done: false }], activity: [] },
      { id: "same-project", name: "Duplicate project", description: "Duplicate", kind: "Web application", status: "Planning", updated: "Recently", createdAt: "2026-01-01T00:00:00.000Z", mode: "Simple", icon: "web", tasks: [], activity: [] },
    ]));
    render(<App />);

    expect(screen.getByText(/Valid projects were recovered/i)).toBeInTheDocument();
    expect(screen.getByText("First valid project")).toBeInTheDocument();
    expect(screen.queryByText("Duplicate project")).not.toBeInTheDocument();

    vi.spyOn(window, "confirm").mockReturnValue(true);
    await user.click(screen.getByRole("button", { name: "Recover and save" }));
    await user.click(screen.getByRole("button", { name: /First valid project/i }));
    expect(screen.getByText("One")).toBeInTheDocument();
    expect(screen.getByText("Two")).toBeInTheDocument();

    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    expect(saved[0].tasks[0].id).not.toBe(saved[0].tasks[1].id);
  });

  it("rejects excessively large stored project collections", () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(
      Array.from({ length: 501 }, (_, index) => ({
        id: `project-${index}`, name: `Project ${index}`, description: "Stored", kind: "Web application",
        status: "Planning", updated: "Recently", createdAt: "2026-01-01T00:00:00.000Z",
        mode: "Simple", icon: "web", tasks: [], activity: [],
      })),
    ));
    render(<App />);

    expect(screen.getByText(/Valid projects were recovered/i)).toBeInTheDocument();
  });

  it("reports failed recovery writes without changing the original data", async () => {
    const user = userEvent.setup();
    const original = JSON.stringify([
      { id: "valid-1", name: "Recovered project", description: "Recovered", kind: "Web application", status: "Planning", updated: "Recently", createdAt: "2026-01-01T00:00:00.000Z", mode: "Simple", icon: "web", tasks: [], activity: [] },
      null,
    ]);
    window.localStorage.setItem(STORAGE_KEY, original);
    render(<App />);

    vi.spyOn(window, "confirm").mockReturnValue(true);
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Storage unavailable", "QuotaExceededError");
    });
    await user.click(screen.getByRole("button", { name: "Recover and save" }));

    expect(screen.getByRole("status")).toHaveTextContent("could not preserve");
  });

  it("reports failed normal persistence and leaves projects in memory", async () => {
    render(<App />);
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Storage unavailable", "QuotaExceededError");
    });

    await createProject("In-memory project");
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "In-memory project" })).toBeInTheDocument();
    });
    expect(screen.getByRole("status")).toHaveTextContent("in memory only");
  });

  it("detects mismatched recovery read-back and restores the original data", async () => {
    const user = userEvent.setup();
    const original = JSON.stringify([
      { id: "valid-1", name: "Recovered project", description: "Recovered", kind: "Web application", status: "Planning", updated: "Recently", createdAt: "2026-01-01T00:00:00.000Z", mode: "Simple", icon: "web", tasks: [], activity: [] },
      null,
    ]);
    window.localStorage.setItem(STORAGE_KEY, original);
    render(<App />);

    vi.spyOn(window, "confirm").mockReturnValue(true);

    const values = new Map<string, string>();
    values.set(STORAGE_KEY, original);
    let recoveryWriteCount = 0;

    vi.spyOn(Storage.prototype, "setItem").mockImplementation((key: string, value: string) => {
      if (key === STORAGE_KEY && recoveryWriteCount === 1) {
        values.set(key, original);
        return;
      }
      if (key === STORAGE_KEY) {
        recoveryWriteCount += 1;
        values.set(key, '{"mismatched":"recovery"}');
        return;
      }
      values.set(key, value);
    });
    vi.spyOn(Storage.prototype, "getItem").mockImplementation((key: string) => values.get(key) ?? null);

    await user.click(screen.getByRole("button", { name: "Recover and save" }));

    expect(screen.getByRole("status")).toHaveTextContent("original browser data was restored unchanged");
    expect(screen.getByRole("status")).not.toHaveTextContent("Recovery completed");
    expect(values.get(STORAGE_KEY)).toBe(original);
  });

  it("rejects oversized project descriptions", () => {
    render(<App />);
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "x".repeat(501) } });
    fireEvent.click(screen.getByRole("button", { name: /create project/i }));
    expect(screen.getByRole("status")).toHaveTextContent("500 characters or fewer");
  });
});
