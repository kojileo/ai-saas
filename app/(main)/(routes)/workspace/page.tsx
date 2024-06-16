"use client";

import { useCallback, useState } from "react";
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
import { useRouter } from "next/navigation";
import { Button, Dropdown, DropdownButton } from "react-bootstrap";

import { initialElements } from "./constants/initialElements";
import NodeDropdown from "./components/NodeDropdown";

export default function HomePage() {
  const router = useRouter();
  const [elements, setElements] = useState<(Node | Edge)[]>(initialElements);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const onLoad = useCallback((reactFlowInstance: { fitView: () => void }) => {
    reactFlowInstance.fitView();
  }, []);

  const addNode = () => {
    setShowDropdown(true);
  };

  const createNodes = () => {
    setShowDropdown(false);
    setElements((els) => {
      const newElements = [...els];
      let lastNode = elements
        .filter((el): el is Node => !("source" in el))
        .slice(-1)[0];

      selectedLabels.forEach((label) => {
        const newNode: Node = {
          id: (newElements.length + 1).toString(),
          data: { label },
          position: {
            x: lastNode ? lastNode.position.x : 50,
            y: lastNode ? lastNode.position.y + 100 : 50,
          },
          style: {
            borderRadius: "15px",
            padding: "10px",
            border: "1px solid #777",
          },
        };
        newElements.push(newNode);
        if (lastNode) {
          const newEdge: Edge = {
            id: `e${lastNode.id}-${newNode.id}`,
            source: lastNode.id,
            target: newNode.id,
            type: "smoothstep",
          };
          newElements.push(newEdge);
        }
        lastNode = newNode;
      });

      return newElements;
    });
    setSelectedLabels([]);
  };

  const removeLastNode = () => {
    setElements((els) => {
      const nodes = els.filter((el): el is Node => !("source" in el));
      const edges = els.filter((el): el is Edge => "source" in el);
      if (nodes.length === 0) return els;

      const lastNode = nodes[nodes.length - 1];
      const updatedNodes = nodes.slice(0, -1);
      const updatedEdges = edges.filter(
        (edge) => edge.source !== lastNode.id && edge.target !== lastNode.id
      );

      return [...updatedNodes, ...updatedEdges];
    });
  };

  const resetElements = () => {
    setElements(initialElements);
  };

  const addEndNode = () => {
    const lastNode = elements
      .filter((el): el is Node => !("source" in el))
      .slice(-1)[0];
    const endNode: Node = {
      id: (elements.length + 1).toString(),
      type: "output",
      data: { label: "End" },
      position: {
        x: lastNode ? lastNode.position.x : 50,
        y: lastNode ? lastNode.position.y + 100 : 50,
      },
      style: {
        borderRadius: "15px",
        padding: "10px",
        border: "1px solid #777",
      },
    };
    setElements((els) => {
      const newElements = [...els, endNode];
      if (lastNode) {
        const newEdge: Edge = {
          id: `e${lastNode.id}-${endNode.id}`,
          source: lastNode.id,
          target: endNode.id,
          type: "smoothstep",
        };
        return [...newElements, newEdge];
      }
      return newElements;
    });
  };

  const onConnect = (params: Connection) =>
    setElements((els) =>
      addEdge(
        { ...params, type: "smoothstep" },
        els.filter((el): el is Edge => "source" in el)
      )
    );

  const handleSelect = (eventKey: string | null) => {
    if (eventKey && !selectedLabels.includes(eventKey)) {
      setSelectedLabels((prev) => [...prev, eventKey]);
    }
  };

  return (
    <div>
      <div className="mb-8 space-y-4">
        <h2 className="text-2xl md:text-4xl font-bold text-center">
          ノーコードアプリ開発ワークスペース
        </h2>
      </div>
      <div className="flex flex-col items-center">
        <button
          onClick={addNode}
          className="mb-4 p-2 bg-blue-500 text-white rounded"
        >
          ノード作成の準備
        </button>
        {showDropdown && (
          <NodeDropdown handleSelect={handleSelect} createNodes={createNodes} />
        )}
      </div>
      <div className="flex justify-center space-x-4 mb-4">
        <button
          onClick={removeLastNode}
          className="p-2 bg-red-500 text-white rounded"
        >
          最新のノードを削除
        </button>
        <button
          onClick={resetElements}
          className="p-2 bg-gray-500 text-white rounded"
        >
          初期化
        </button>
        <button
          onClick={addEndNode}
          className="p-2 bg-green-500 text-white rounded"
        >
          Endノードを追加
        </button>
        <button className="p-2 bg-purple-500 text-white rounded">
          WebAPI作成
        </button>
        <button className="p-2 bg-orange-500 text-white rounded">
          Web画面作成
        </button>
      </div>
      <ReactFlowProvider>
        <div style={{ height: 500 }}>
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
        </div>
      </ReactFlowProvider>
    </div>
  );
}
