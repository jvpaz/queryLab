import { getDatabase } from "@/lib/db/engine";
import { useWorkspaceStore } from "@/store/workspace";
import { Connection } from "@xyflow/react";
import { handleQuote } from "./handleQuote";

const COLUMN_REGEX = /^[^.]+\.(.+)-(?:left|right)$/;

function getColumnName(handle: string): string | null {
  return handle.match(COLUMN_REGEX)?.[1] ?? null;
}

export async function handleEdgeConnection(params: Connection): Promise<boolean> {


  const { source, sourceHandle, target, targetHandle } = params;
  if (!source || !sourceHandle || !target || !targetHandle) {
    useWorkspaceStore.getState().setQueryError("Conexão de parametros inválida");
    throw new Error("Conexão de parametros inválida");
  }

  const sourceColumn = getColumnName(sourceHandle);
  const targetColumn = getColumnName(targetHandle);

  if (!sourceColumn || !targetColumn) {
    throw new Error("Coluna inválida");
  }

  console.log(params);

  //TODO - Gambiarra, ver uma forma de melhorar isso depois.

  const db = await getDatabase();
  const alterTable = async () =>
  {
    try {
      await db.exec(
        `ALTER TABLE ${handleQuote(source)} ADD FOREIGN KEY (${handleQuote(sourceColumn)}) REFERENCES ${handleQuote(target)} (${handleQuote(targetColumn)});`,
      )
      return true;
    }
  catch (error) {
    await db.exec(`ALTER TABLE ${handleQuote(target)} ADD FOREIGN KEY (${handleQuote(targetColumn)}) REFERENCES ${handleQuote(source)} (${handleQuote(sourceColumn)});`);
    return true;
  }
  }
  
  try {
  return await alterTable();
} catch (erro) {
  useWorkspaceStore.getState().setQueryError("Erro ao criar a chave estrangeira, verifique se a coluna de origem e destino possuem o mesmo tipo de dado e não são nulas.");
  return false;
}

}