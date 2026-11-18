import { useState } from "react";
import { useReactFlow, type Node } from "@xyflow/react";
import { executeBatch, getDatabase, getSchema } from "@/lib/db/engine";
import { useWorkspaceStore } from "@/store/workspace";
import type { TableDefinition } from "@/types/database";
import { handleQuote } from "../utils/handleQuote";

export type ColumnAction = "rename" | "delete" | "nullable" | "primary" | "alter";

const allowedColumnTypes = new Set([
  "smallint", "integer", "bigint", "serial", "numeric", "real", "double precision",
  "text", "varchar", "char", "date", "time", "timestamp", "timestamptz", "interval",
  "boolean", "uuid", "json", "jsonb", "bytea",
]);

export function useColumnActions(table: TableDefinition) {
  const [busy, setBusy] = useState(false);
  const { updateNodeData } = useReactFlow<Node<TableDefinition, "table">>();

  const refreshSchema = async () => {
    const schema = await getSchema();
    const latestTables = schema.map((item) => {
      const oldTables = useWorkspaceStore.getState().tables.find((candidate) => candidate.name === item.name);
      return oldTables ? { ...item, position: oldTables.position } : item;
    });
    useWorkspaceStore.getState().setTables(latestTables);
    const updatedTable = latestTables.find((item) => item.name === table.name);
    if (updatedTable) updateNodeData(table.id, updatedTable);
  };

    //Arrumar possível confusão com tipo value, que no momento pode ser tanto o novo nome da coluna quanto o novo tipo da coluna, dependendo do action.
  const mutateColumn = async (columnName: string, action: ColumnAction, value = "") => {
    if (busy) return;
    const column = table.columns.find((item) => item.name === columnName);
    if (!column) return;

    setBusy(true);
    try {
      const tableSql = handleQuote(table.name);
      const columnSql = handleQuote(column.name);
      if (action === "rename") {
        const trimmedName = value.trim();
        if (!trimmedName || trimmedName === column.name) return;
        await executeBatch(`ALTER TABLE ${tableSql} RENAME COLUMN ${columnSql} TO ${handleQuote(trimmedName)};`);
      } else if (action === "delete") {
        await executeBatch(`ALTER TABLE ${tableSql} DROP COLUMN ${columnSql};`);
      } else if (action === "nullable") {
        await executeBatch(`ALTER TABLE ${tableSql} ALTER COLUMN ${columnSql} ${column.nullable === false ? "DROP NOT NULL" : "SET NOT NULL"};`);
      } else if (action === "alter") {
        if (!allowedColumnTypes.has(value)) {
          throw new Error("Tipo de coluna inválido.");
        }
        if (value !== column.type) {
          await executeBatch(`ALTER TABLE ${tableSql} ALTER COLUMN ${columnSql} TYPE ${value} USING ${columnSql}::${value};`);
        }
      } else if (action === "primary") {
        const db = await getDatabase();
        if (column.primaryKey) {
          const constraints = await db.query<{ constraint_name: string }>(
            "SELECT conname AS constraint_name FROM pg_constraint WHERE conrelid = to_regclass($1) AND contype = 'p'",
            [table.name],
          );
          const constraint = constraints.rows[0]?.constraint_name;
          if (constraint) await executeBatch(`ALTER TABLE ${tableSql} DROP CONSTRAINT ${handleQuote(constraint)};`);
        } else {
          await executeBatch(`ALTER TABLE ${tableSql} ADD PRIMARY KEY (${columnSql});`);
        }
      }

      await refreshSchema();
      useWorkspaceStore.getState().setQueryError(null);
    } catch (error) {
      useWorkspaceStore.getState().setQueryError(error instanceof Error ? error.message : "Não foi possível alterar a coluna.");
    } finally {
      setBusy(false);
    }
  };

  return { busy, mutateColumn };
}
