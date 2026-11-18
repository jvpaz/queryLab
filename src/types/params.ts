import { TableFlowNode } from "@/features/workspace/components/TableNode";
import { Edge, OnEdgesChange } from "@xyflow/react";
import { TableDefinition } from "./database";

export type CanvasActionsParams = {
  setEdges: (edges: any) => void;
  edges: Edge[];
  onEdgesChange: OnEdgesChange<Edge>;
  setQueryError: (error: string | null) => void;
  setEdgeForRelationType: (edge: Edge | null) => void;
  edgeForRelationType: Edge | null;
  relationType: string;
  setRelationType: (type: string) => void;
  setRelationModalPosition: (position: { x: number; y: number }) => void;
}

export type QueryHookParams = {
    nodes: TableFlowNode[];
    setNodes: (nodes: TableFlowNode[]) => void;
    edges: Edge[];
    setEdges: (edges: Edge[]) => void;
}

export type WorkspaceActionsParams = {
  notify: (message: string) => void;
  sql: string;
  tables: TableDefinition[];
};
