import { memo, useState } from "react";
import { KeyRound, Table2, Link, Plus, CircleMinus, Asterisk } from "lucide-react";
import { Handle, Position, useEdges, type Node, type NodeProps } from "@xyflow/react";
import type { TableDefinition } from "@/types/database";
import { useEditableName } from "../hooks/useEditableName";
import { useAddColumn } from "../hooks/useAddColumn";

export type TableFlowNode = Node<TableDefinition, "table">;

function TableNode({ data, selected}: NodeProps<TableFlowNode>) {
  
  const { name, setName, inputRef, save, cancel } = useEditableName(data.name);
  const [editingNode, setEditingNode] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const addColumn = useAddColumn(data.name, data.columns);

  const edges = useEdges();

  return (
    <div
      className="table-node"
      style={selected ? { borderColor: "var(--accent)" } : undefined}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="table-heading" onDoubleClick={() => setEditingNode(true)}>
        <span className="table-name">
          <Table2 size={14} className="table-icon" />
          {editingNode ? (
            <input
              ref={inputRef}
              className="table-name"
              value={name}
              autoFocus
              onChange={(e) => setName(e.target.value)}
              onBlur={() => {
                save().finally(() => setEditingNode(false));
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.currentTarget.blur();
                }
                if (e.key === "Escape") {
                  cancel();
                  setEditingNode(false);
                }
              }}
            />
          ) : (
            data.name
          )}
        </span>
      </div>
      {data.columns.map((column) => {

          //TODO - Gambiarra, ver uma forma de arrumar isso depois

          const handleIdRight = data.name + "." + column.name + "-right";
           const isForeignKey =
    column.foreignKey || edges.some((edge) => edge.sourceHandle === handleIdRight);

        return (

        

        <div className="column" key={column.name}>
          <Handle
        type="target"
        position={Position.Left}
        style={{ background: "#78a9ff", border: 0, width: 7, height: 7, position: "absolute" }}
        id={data.name + "." + column.name + "-left"}
      />
          
          <span className="column-left">
            
              {column.primaryKey ? 
                <span className="column-key">
              <KeyRound size={10} /> 
                </span>
              : ""}

              {!column.primaryKey && !column.nullable ?
                <span className="column-nullable">
                  <Asterisk size={10} />
                </span>
              : ""} 
                
              {isForeignKey ? 
                <span className="column-foreign">
              <Link size={10} /> 
                </span>
              : ""}
            
            {column.name}
          </span>
          <span className="column-type">{column.type}</span>
          <Handle
        type="source"
        position={Position.Right}
        style={{ background: "#78a9ff", border: 0, width: 7, height: 7, position: "absolute" }}
        id={data.name + "." + column.name + "-right"}
      />
        </div>
        
      )}  )}
      <div className="table-footer">{data.columns.length} colunas

        <span className="table-count">{data.rowCount ?? 0} linhas</span>
      </div>
      <button
        type="button"
        className={`add-column-button nodrag nopan${isHovered ? " is-visible" : ""}`}
        aria-label={`Adicionar coluna à tabela ${data.name}`}
        title="Adicionar coluna"
        onMouseDown={(event) => event.stopPropagation()}
        onClick={() => void addColumn()}
        tabIndex={isHovered ? 0 : -1}
      >
        <Plus size={15} />
      </button>
    </div>
  );
}

export default memo(TableNode);
