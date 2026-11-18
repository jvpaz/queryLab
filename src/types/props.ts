import { TableDefinition } from "./database";

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