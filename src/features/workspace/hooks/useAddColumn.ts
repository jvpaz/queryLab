import { useRef } from "react";
import { useReactFlow } from "@xyflow/react";
import { executeBatch } from "@/lib/db/engine";
import { useWorkspaceStore } from "@/store/workspace";
import type { ColumnDefinition } from "@/types/database";
import type { TableFlowNode } from "../components/TableNode";
import { handleQuote } from "../utils/handleQuote";

export function useAddColumn(tableName: string, columns: ColumnDefinition[]) {
  const { updateNodeData } = useReactFlow<TableFlowNode>();
  const savingRef = useRef(false);

  return async () => {
    if (savingRef.current) return;
    savingRef.current = true;

    try {
      const existingNames = new Set(columns.map((column) => column.name));
      let suffix = 1;
      let columnName = `nova_coluna_${suffix}`;
      while (existingNames.has(columnName)) {
        suffix += 1;
        columnName = `nova_coluna_${suffix}`;
      }

      await executeBatch(
        `ALTER TABLE ${handleQuote(tableName)} ADD COLUMN ${handleQuote(columnName)} TEXT;`,
      );

      const updatedColumns = [...columns, { name: columnName, type: "text", nullable: true }];
      updateNodeData(tableName, { columns: updatedColumns });
      useWorkspaceStore.getState().updateTableColumns(tableName, updatedColumns);
      useWorkspaceStore.getState().setQueryError(null);
    } catch (error) {
      console.error("Erro adicionando coluna:", error);
      useWorkspaceStore
        .getState()
        .setQueryError("Não foi possível adicionar a coluna à tabela.");
    } finally {
      savingRef.current = false;
    }
  };
}
