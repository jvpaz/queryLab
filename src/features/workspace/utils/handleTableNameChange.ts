import { executeBatch } from "@/lib/db/engine";
import { useWorkspaceStore } from "@/store/workspace";
import type { ReactFlowInstance } from "@xyflow/react";
import { handleQuote } from "../utils/handleQuote";

export async function handleTableNameChange(
  rf: ReactFlowInstance,
  oldName: string,
  newName: string,
) {
  await executeBatch(
    `ALTER TABLE ${handleQuote(oldName)} RENAME TO ${handleQuote(newName)};`,
  );

  rf.setNodes((nodes) =>
    nodes.map((node) =>
      node.type === "table" && node.id === oldName
        ? {
            ...node,
            id: newName,
            data: { ...node.data, id: newName, name: newName },
          }
        : node,
    ),
  );

  const renameHandle = (handle?: string | null) =>
    handle?.startsWith(`${oldName}.`)
      ? `${newName}${handle.slice(oldName.length)}`
      : handle;

  rf.setEdges((edges) =>
    edges.map((edge) => ({
      ...edge,
      source: edge.source === oldName ? newName : edge.source,
      target: edge.target === oldName ? newName : edge.target,
      sourceHandle: renameHandle(edge.sourceHandle),
      targetHandle: renameHandle(edge.targetHandle),
    })),
  );

  useWorkspaceStore.getState().updateTableName(oldName, newName);
}
