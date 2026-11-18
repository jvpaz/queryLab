import { ColumnEditorProps } from "@/types/props";
import { Check, KeyRound, Trash2, X } from "lucide-react";
import { useState } from "react";


export default function ColumnEditor({ column, busy, onAction, onClose }: ColumnEditorProps) {
  const [name, setName] = useState(column.name);

  return (
    <div className="column-editor nodrag nopan" onMouseDown={(event) => event.stopPropagation()}>
      <label>
        Coluna selecionada
        <input
          aria-label="Nome da coluna"
          value={name}
          onChange={(event) => setName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") onAction("rename", name);
            if (event.key === "Escape") onClose();
          }}
        />
      </label>
      <div className="column-editor-actions">
        <button type="button" title="Salvar nome" aria-label="Salvar nome" disabled={busy} onClick={() => onAction("rename", name)}><Check size={13} /></button>
        <button type="button" title={column.nullable === false ? "Permitir NULL" : "Definir NOT NULL"} disabled={busy} onClick={() => onAction("nullable")}>{column.nullable === false ? "NULL" : "NOT NULL"}</button>
        <button type="button" title={column.primaryKey ? "Remover chave primária" : "Definir chave primária"} disabled={busy} onClick={() => onAction("primary")}><KeyRound size={13} /></button>
        <button type="button" title="Excluir coluna" aria-label="Excluir coluna" disabled={busy} onClick={() => onAction("delete")}><Trash2 size={13} /></button>
        <button type="button" title="Fechar" aria-label="Fechar edição" onClick={onClose}><X size={13} /></button>
      </div>
    </div>
  );
}
