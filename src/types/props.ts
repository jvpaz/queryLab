import { ColumnAction } from "@/features/workspace/hooks/useColumnActions";
import { ColumnDefinition, TableDefinition } from "./database";

export type RelationModalProps = {
  relationModalPosition: { x: number; y: number };
  relationType: string;
  saveRelationType: (type: string) => void;
};

export type TableUtilsProps = {
    tables:  TableDefinition[];
    setTables: (tables: TableDefinition[]) => void;
    setNodes: (nodes: any) => void;
    notify: (message: string) => void;
    rowCount?: number;
}

export type ColumnEditorProps = {
  column: ColumnDefinition;
  busy: boolean;
  onAction: (action: ColumnAction, nextName?: string) => void;
  onClose: () => void;
};