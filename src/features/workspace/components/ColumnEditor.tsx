import { ColumnEditorProps } from "@/types/props";
import { Check, KeyRound, Trash2, X } from "lucide-react";
import { useState } from "react";

const aliasType = (type: string) => {
  const aliases: Record<string, string> = {
    "character varying": "varchar",
    character: "char",
    "time without time zone": "time",
    "timestamp without time zone": "timestamp",
    "timestamp with time zone": "timestamptz",
  };
  return aliases[type] ?? type;
};

export default function ColumnEditor({ column, busy, onAction, onClose }: ColumnEditorProps) {
  const [name, setName] = useState(column.name);
  const [type, setType] = useState(() => aliasType(column.type));

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
      <label className="column-editor-type">
        Tipo da coluna
        <select
          className="select"
          disabled={busy}
          value={type}
          onChange={(event) => {
            const nextType = event.target.value;
            setType(nextType);
            onAction("alter",  nextType);
          }}
          aria-label="Tipo da coluna"
        >
          <optgroup label="Numéricos">
            <option value="smallint">smallint</option>
            <option value="integer">integer</option>
            <option value="bigint">bigint</option>
            <option value="numeric">numeric</option>
            <option value="real">real</option>
            <option value="double precision">double precision</option>
          </optgroup>
          <optgroup label="Texto">
            <option value="text">text</option>
            <option value="varchar">varchar</option>
            <option value="char">char</option>
          </optgroup>
          <optgroup label="Data e hora">
            <option value="date">date</option>
            <option value="time">time</option>
            <option value="timestamp">timestamp</option>
            <option value="timestamptz">timestamptz</option>
            <option value="interval">interval</option>
          </optgroup>
          <optgroup label="Outros">
            <option value="boolean">boolean</option>
            <option value="uuid">uuid</option>
            <option value="json">json</option>
            <option value="jsonb">jsonb</option>
            <option value="bytea">bytea</option>
          </optgroup>
        </select>
      </label>
    </div>
  );
}
