import React, { useCallback } from "react";
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  MiniMap,
  Controls,
  Background,
  Node,
  Edge,
  Connection,
} from "react-flow-renderer";

interface FlowCanvasProps {
  elements: (Node | Edge)[];
  onElementsChange: (newElements: (Node | Edge)[]) => void;
  onConnect: (params: Connection) => void;
}

const FlowCanvas: React.FC<FlowCanvasProps> = ({
  elements,
  onElementsChange,
  onConnect,
}) => {
  const onLoad = useCallback((reactFlowInstance: { fitView: () => void }) => {
    reactFlowInstance.fitView();
  }, []);

  return (
    <div style={{ height: 500 }}>
      <ReactFlowProvider>
        <ReactFlow
          nodes={elements.filter((el): el is Node => !("source" in el))}
          edges={elements.filter((el): el is Edge => "source" in el)}
          onInit={onLoad}
          onConnect={onConnect}
          style={{ width: "100%", height: "100%" }}
        >
          <MiniMap />
          <Controls />
          <Background />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
};

export default FlowCanvas;
