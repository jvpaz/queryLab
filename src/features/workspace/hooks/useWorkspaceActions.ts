import { exportDatabase } from "@/lib/db/engine";
import { saveWorkspace } from "@/lib/storage/workspaces";
import { WorkspaceActionsParams } from "@/types/params";
import { useCallback } from "react";


export function useWorkspaceActions({notify, sql, tables}: WorkspaceActionsParams) {

    const downloadDb = useCallback(async () => {
    try {
      const bytes = await exportDatabase();
      const url = URL.createObjectURL(bytes);
      const link = document.createElement("a");
      link.href = url;
      link.download = bytes.name || "querylab.sql";
      link.click();
      URL.revokeObjectURL(url);
      notify("Banco exportado.");
    } catch {
      notify("Não foi possível exportar o banco.");
    }
  }, [notify]);

  //TODO - PGlite possui salvamento próprio, adaptar para ele depois
  const save = useCallback(async () => {
    try {
      await saveWorkspace({
        id: "default",
        name: "Meu workspace",
        sql,
        tables,
        updatedAt: Date.now(),
      });
      notify("Salvamento de workspace ainda em desenvolvimento.");
    } catch {
      notify("Não foi possível salvar no navegador.");
    }
  }, [notify, sql, tables]);

  return { downloadDb, save };
}