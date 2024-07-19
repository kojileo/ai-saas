import React, { useState, useCallback } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  NodeChange,
  EdgeChange,
  Connection,
  Node as ReactFlowNode,
  BackgroundVariant,
} from "reactflow";
import "reactflow/dist/style.css";
import { ChevronRight, Plus, Save, Play, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type NodeType = ReactFlowNode & { type: string };

const initialNodes: NodeType[] = [
  {
    id: "1",
    data: { label: "User Input" },
    position: { x: 250, y: 5 },
    type: "input",
  },
  {
    id: "2",
    data: { label: "LLM Processing" },
    position: { x: 250, y: 100 },
    type: "default",
  },
  {
    id: "3",
    data: { label: "Final Output" },
    position: { x: 250, y: 200 },
    type: "output",
  },
];

const initialEdges = [
  { id: "e1-2", source: "1", target: "2" },
  { id: "e2-3", source: "2", target: "3" },
];

const PromptFlow = () => {
  const [nodes, setNodes] = useState<NodeType[]>(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<NodeType | null>(null);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) =>
      setNodes(
        (nds: NodeType[]) => applyNodeChanges(changes, nds) as NodeType[]
      ),
    [setNodes]
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );
  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  const handleNodeClick = (event: React.MouseEvent, node: ReactFlowNode) => {
    event.preventDefault();
    setSelectedNode(node as NodeType);
  };

  const handleAddNode = (type: string) => {
    const newNode: NodeType = {
      id: (nodes.length + 1).toString(),
      data: { label: `New Node ${nodes.length + 1}` },
      position: { x: 250, y: nodes.length * 100 + 50 },
      type: type,
    };
    setNodes([...nodes, newNode]);
  };

  const handleDeleteNode = () => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
      setEdges((eds) =>
        eds.filter(
          (edge) =>
            edge.source !== selectedNode.id && edge.target !== selectedNode.id
        )
      );
      setSelectedNode(null);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Sidebar */}
      <div className="w-64 bg-white border-r p-4">
        <h2 className="text-xl font-bold mb-4">Nodes</h2>
        {nodes.map((node) => (
          <div
            key={node.id}
            className={`p-2 mb-2 rounded cursor-pointer ${
              selectedNode === node ? "bg-blue-100" : "hover:bg-gray-100"
            }`}
            onClick={() => setSelectedNode(node)}
          >
            {node.data.label}
          </div>
        ))}
        <Button
          onClick={() => handleAddNode("default")}
          className="mt-4 w-full"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Default Node
        </Button>
        <Button onClick={() => handleAddNode("input")} className="mt-4 w-full">
          <Plus className="mr-2 h-4 w-4" /> Add Input Node
        </Button>
        <Button onClick={() => handleAddNode("output")} className="mt-4 w-full">
          <Plus className="mr-2 h-4 w-4" /> Add Output Node
        </Button>
        <Button onClick={handleDeleteNode} className="mt-4 w-full">
          <Plus className="mr-2 h-4 w-4" /> Delete Node
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4">
        <div className="mb-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Prompt Flow</h1>
          <div>
            <Button variant="outline" className="mr-2">
              <Save className="mr-2 h-4 w-4" /> Save
            </Button>
            <Button>
              <Play className="mr-2 h-4 w-4" /> Run
            </Button>
          </div>
        </div>

        {/* Flow Canvas */}
        <div className="bg-white border rounded-lg h-[calc(100vh-12rem)]">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={handleNodeClick}
          >
            <Controls />
            <MiniMap />
            <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          </ReactFlow>
        </div>
      </div>

      {/* Right Sidebar */}
      {selectedNode && (
        <div className="w-80 bg-white border-l p-4">
          <h2 className="text-xl font-bold mb-4">Node Properties</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <Input
              value={selectedNode.data.label}
              onChange={(e) => {
                const updatedNodes = nodes.map((node) =>
                  node.id === selectedNode.id
                    ? { ...node, data: { ...node.data, label: e.target.value } }
                    : node
                );
                setNodes(updatedNodes);
                setSelectedNode({
                  ...selectedNode,
                  data: { ...selectedNode.data, label: e.target.value },
                });
              }}
              className="mt-1"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Type
            </label>
            <Input value={selectedNode.type} readOnly className="mt-1" />
          </div>
          <Button variant="outline" className="w-full">
            <Settings className="mr-2 h-4 w-4" /> Configure
          </Button>
        </div>
      )}
    </div>
  );
};

export default PromptFlow;
