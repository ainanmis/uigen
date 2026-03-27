"use client";

import { Loader2 } from "lucide-react";

export interface ToolCallBadgeProps {
  toolName: string;
  args: Record<string, unknown>;
  state: "partial-call" | "call" | "result";
  result?: unknown;
}

export function getToolCallLabel(
  toolName: string,
  args: Record<string, unknown>
): string {
  if (toolName === "str_replace_editor") {
    const command = args.command as string | undefined;
    const path = (args.path as string | undefined) ?? "";
    switch (command) {
      case "create":
        return `Creating ${path}`;
      case "str_replace":
        return `Editing ${path}`;
      case "insert":
        return `Editing ${path}`;
      case "view":
        return `Reading ${path}`;
      case "undo_edit":
        return `Reverting ${path}`;
    }
  }
  if (toolName === "file_manager") {
    const command = args.command as string | undefined;
    const path = (args.path as string | undefined) ?? "";
    switch (command) {
      case "rename":
        return `Renaming ${path} → ${(args.new_path as string | undefined) ?? ""}`;
      case "delete":
        return `Deleting ${path}`;
    }
  }
  return toolName;
}

export function ToolCallBadge({ toolName, args, state, result }: ToolCallBadgeProps) {
  const label = getToolCallLabel(toolName, args);
  const isDone = state === "result" && result !== undefined;

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isDone ? (
        <>
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-neutral-700">{label}</span>
        </>
      ) : (
        <>
          <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
          <span className="text-neutral-700">{label}</span>
        </>
      )}
    </div>
  );
}
