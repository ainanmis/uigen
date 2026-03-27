import { test, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolCallBadge, getToolCallLabel } from "../ToolCallBadge";

vi.mock("lucide-react", () => ({
  Loader2: () => <div data-testid="loader-icon" />,
}));

afterEach(() => {
  cleanup();
});

// --- getToolCallLabel unit tests ---

test("str_replace_editor create returns Creating label", () => {
  expect(getToolCallLabel("str_replace_editor", { command: "create", path: "src/Button.tsx" })).toBe("Creating src/Button.tsx");
});

test("str_replace_editor str_replace returns Editing label", () => {
  expect(getToolCallLabel("str_replace_editor", { command: "str_replace", path: "src/App.tsx" })).toBe("Editing src/App.tsx");
});

test("str_replace_editor insert returns Editing label", () => {
  expect(getToolCallLabel("str_replace_editor", { command: "insert", path: "src/App.tsx" })).toBe("Editing src/App.tsx");
});

test("str_replace_editor view returns Reading label", () => {
  expect(getToolCallLabel("str_replace_editor", { command: "view", path: "src/index.ts" })).toBe("Reading src/index.ts");
});

test("str_replace_editor undo_edit returns Reverting label", () => {
  expect(getToolCallLabel("str_replace_editor", { command: "undo_edit", path: "src/Card.tsx" })).toBe("Reverting src/Card.tsx");
});

test("file_manager rename returns Renaming label with arrow", () => {
  expect(
    getToolCallLabel("file_manager", { command: "rename", path: "src/old.tsx", new_path: "src/new.tsx" })
  ).toBe("Renaming src/old.tsx → src/new.tsx");
});

test("file_manager delete returns Deleting label", () => {
  expect(getToolCallLabel("file_manager", { command: "delete", path: "src/unused.tsx" })).toBe("Deleting src/unused.tsx");
});

test("unknown tool returns raw tool name as fallback", () => {
  expect(getToolCallLabel("some_unknown_tool", { command: "do_thing", path: "foo" })).toBe("some_unknown_tool");
});

test("known tool with unknown command falls through to raw tool name", () => {
  expect(getToolCallLabel("str_replace_editor", { command: "unknown_cmd", path: "src/App.tsx" })).toBe("str_replace_editor");
});

test("empty path renders label without undefined", () => {
  const label = getToolCallLabel("str_replace_editor", { command: "create", path: "" });
  expect(label).toBe("Creating ");
  expect(label).not.toContain("undefined");
});

// --- ToolCallBadge render tests ---

test("shows loader icon when state is call", () => {
  const { container } = render(
    <ToolCallBadge toolName="str_replace_editor" args={{ command: "create", path: "/App.jsx" }} state="call" />
  );
  expect(screen.getByTestId("loader-icon")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});

test("shows loader icon when state is partial-call", () => {
  const { container } = render(
    <ToolCallBadge toolName="str_replace_editor" args={{ command: "create", path: "/App.jsx" }} state="partial-call" />
  );
  expect(screen.getByTestId("loader-icon")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});

test("shows green dot when state is result with a result value", () => {
  const { container } = render(
    <ToolCallBadge toolName="str_replace_editor" args={{ command: "create", path: "/App.jsx" }} state="result" result="ok" />
  );
  expect(container.querySelector(".bg-emerald-500")).toBeDefined();
  expect(screen.queryByTestId("loader-icon")).toBeNull();
});

test("shows loader when state is result but result is undefined", () => {
  const { container } = render(
    <ToolCallBadge toolName="str_replace_editor" args={{ command: "create", path: "/App.jsx" }} state="result" result={undefined} />
  );
  expect(screen.getByTestId("loader-icon")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});

test("shows human-readable label instead of raw tool name", () => {
  render(
    <ToolCallBadge toolName="str_replace_editor" args={{ command: "create", path: "/App.jsx" }} state="result" result="ok" />
  );
  expect(screen.getByText("Creating /App.jsx")).toBeDefined();
  expect(screen.queryByText("str_replace_editor")).toBeNull();
});

test("renders rename label with arrow character correctly", () => {
  render(
    <ToolCallBadge
      toolName="file_manager"
      args={{ command: "rename", path: "src/old.tsx", new_path: "src/new.tsx" }}
      state="result"
      result="ok"
    />
  );
  expect(screen.getByText("Renaming src/old.tsx → src/new.tsx")).toBeDefined();
});

test("renders fallback label for unknown tool", () => {
  render(
    <ToolCallBadge toolName="custom_tool" args={{}} state="call" />
  );
  expect(screen.getByText("custom_tool")).toBeDefined();
});
