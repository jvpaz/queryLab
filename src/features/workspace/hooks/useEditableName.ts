import { useReactFlow } from "@xyflow/react";
import { useState, useRef } from "react";
import { handleTableNameChange } from "../utils/handleTableNameChange";

export function useEditableName(currentName: string) {
  const reactFlowInstance = useReactFlow();
  const [name, setName] = useState(currentName);
  const inputRef = useRef<HTMLInputElement>(null);

  //Impede concorrência de renomeação de tabelas.
  const savingRef = useRef(false);

  const save = async () => {
    if (savingRef.current) return;
    const trimmed = name.trim();
    if (!trimmed || trimmed === currentName) {
      setName(currentName);
      return;
    }

    savingRef.current = true;
    try {
      await handleTableNameChange(reactFlowInstance, currentName, trimmed);
    } catch (err) {
      console.error("Erro renomeando tabela:", err);
      setName(currentName);
    } finally {
      savingRef.current = false;
    }
  };

  const cancel = () => {
    setName(currentName);
  };

  return { name, setName, inputRef, save, cancel };
}
