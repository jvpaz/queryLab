import { Connection, addEdge, Edge, EdgeChange } from "@xyflow/react";
import { useCallback } from "react";
import { handleEdgeConnection } from "../utils/handleEdgeConnection";
import { CanvasActionsParams } from "@/types/params";
import { dropForeignKeyForRelation } from "@/lib/db/engine";

export function useCanvasActions({setEdges, edges, onEdgesChange, setQueryError, setEdgeForRelationType, edgeForRelationType, relationType, setRelationType, setRelationModalPosition}: CanvasActionsParams)
{

  const onConnect = useCallback(
    async (connection: Connection) => {


      const ok = await handleEdgeConnection(connection);
    if (!ok) return;

      setEdges((current: any) =>
        addEdge<Edge>(
          { ...connection, type: "relation", style: { stroke: "#596373" } },
          current,
        ),
      )

    },
    [setEdges, handleEdgeConnection],
  );

  const handleEdgesChange = useCallback(async (changes: EdgeChange<Edge>[]) => {
    const removedIds = new Set(changes.filter((change) => change.type === "remove").map((change) => change.id));
    const removedEdges = edges.filter((edge) => removedIds.has(edge.id));
    const failedIds = new Set<string>();

    for (const edge of removedEdges) {
      try {
        await dropForeignKeyForRelation(edge);
      } catch (error) {
        failedIds.add(edge.id);
        setQueryError(error instanceof Error ? error.message : "Não foi possível remover a chave estrangeira.");
      }
    }

    onEdgesChange(changes.filter((change) => change.type !== "remove" || !failedIds.has(change.id)));
  }, [edges, onEdgesChange, setQueryError]);

  const onEdgeClick = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      setEdgeForRelationType(edge);
      setRelationType(String(edge.label ?? "1:N"));
      setRelationModalPosition({ x: event.clientX, y: event.clientY });
    },
    [],
  );

  const saveRelationType = useCallback((relationType: string) => {
    if (!edgeForRelationType) return;

    if (!relationType) {
      handleEdgesChange([{ id: edgeForRelationType.id, type: "remove" }]);
      setEdgeForRelationType(null);
      return;
    }

    setEdges((current: any) =>
      current.map((edge: any) =>
        edge.id === edgeForRelationType.id
          ? { ...edge, label: relationType }
          : edge,
      ),
    );
    setEdgeForRelationType(null);
  }, [edgeForRelationType, handleEdgesChange, setEdgeForRelationType, setEdges]);


    return { onConnect, onEdgeClick, handleEdgesChange, saveRelationType };
}
