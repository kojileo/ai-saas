import React, { useState, useCallback } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Node,
  Edge,
  Connection,
  BackgroundVariant,
  NodeChange,
  EdgeChange,
} from "reactflow";
import "reactflow/dist/style.css";
import { Plus, Play, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type NodeData = {
  label: string;
  nodeType: string;
  nodeParameter: Record<string, any>;
};

type FlowNode = Node<NodeData>;

type ApiRequest = {
  apiEndPoint: string;
  description: string;
  apiType: string;
  apiRequestParameters: any[];
  apiRequestHeaders: any[];
  apiRequestBody: any[];
  apiResponseHeaders: any[];
  apiResponseBody: any[];
  flow: Array<{
    node?: {
      nodeName: string;
      nodeType: string;
      nodeParameter: any[];
      entryPoint: boolean;
    };
    edge?: {
      edgeType: string;
      edgeFrom: string;
      edgeTo: string | string[];
    };
  }>;
};

const nodeTypes = [
  { value: "inputFile", label: "ファイル入力" },
  { value: "if", label: "条件" },
  { value: "summarize", label: "要約" },
  { value: "end", label: "END" },
];

const initialNodes: FlowNode[] = [
  {
    id: "1",
    type: "input",
    data: { label: "開始", nodeType: "start", nodeParameter: {} },
    position: { x: 250, y: 5 },
  },
];

const PromptFlow = () => {
  const [nodes, setNodes] = useState<FlowNode[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<FlowNode | null>(null);
  const [apiEndpoint, setApiEndpoint] = useState("");
  const [executionResult, setExecutionResult] = useState(null);
  const [executionError, setExecutionError] = useState<string | null>(null);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) =>
      setNodes((nds) => applyNodeChanges(changes, nds)),
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

  const handleNodeClick = (event: React.MouseEvent, node: Node) => {
    event.preventDefault();
    setSelectedNode(node);
  };

  const handleAddNode = () => {
    const newNode: FlowNode = {
      id: (nodes.length + 1).toString(),
      type: "default",
      data: { label: "新規ノード", nodeType: "inputFile", nodeParameter: {} },
      position: { x: 250, y: nodes.length * 100 },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const handleDeleteNode = () => {
    if (selectedNode && selectedNode.id !== "1") {
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

  const handleNodePropertyChange = (property: string, value: any) => {
    if (selectedNode) {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === selectedNode.id
            ? { ...node, data: { ...node.data, [property]: value } }
            : node
        )
      );
      setSelectedNode({
        ...selectedNode,
        data: { ...selectedNode.data, [property]: value },
      });
    }
  };

  const renderNodeConfig = () => {
    if (!selectedNode) return null;

    switch (selectedNode.data.nodeType) {
      case "inputFile":
        return (
          <Input
            placeholder="ファイルパスを入力"
            value={selectedNode.data.nodeParameter.path || ""}
            onChange={(e) =>
              handleNodePropertyChange("nodeParameter", {
                ...selectedNode.data.nodeParameter,
                path: e.target.value,
              })
            }
          />
        );
      case "if":
        return (
          <Input
            placeholder="条件を入力"
            value={selectedNode.data.nodeParameter.condition || ""}
            onChange={(e) =>
              handleNodePropertyChange("nodeParameter", {
                ...selectedNode.data.nodeParameter,
                condition: e.target.value,
              })
            }
          />
        );
      case "summarize":
        return (
          <Input
            placeholder="モデルを入力"
            value={selectedNode.data.nodeParameter.model || ""}
            onChange={(e) =>
              handleNodePropertyChange("nodeParameter", {
                ...selectedNode.data.nodeParameter,
                model: e.target.value,
              })
            }
          />
        );
      default:
        return null;
    }
  };

  const handleExecute = async () => {
    setApiEndpoint("http://localhost:8000/createapi");
    setExecutionResult(null);
    setExecutionError(null);

    const apiRequest: ApiRequest = {
      apiEndPoint: "summarizeFile",
      description:
        "インプットに指定したファイルを要約してテキストとして返却するAPIです。",
      apiType: "POST",
      apiRequestParameters: [],
      apiRequestHeaders: [],
      apiRequestBody: [
        {
          fileName: "{FilePath}",
        },
      ],
      apiResponseHeaders: [],
      apiResponseBody: [
        {
          message: "{Message}",
        },
      ],
      flow: nodes.map((node, index) => ({
        node: {
          nodeName: node.data.label,
          nodeType: node.data.nodeType,
          nodeParameter: [node.data.nodeParameter],
          entryPoint: index === 0,
        },
      })),
    };

    console.log("送信データ:", JSON.stringify(apiRequest, null, 2));

    try {
      const response = await fetch("http://localhost:8000/createapi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiRequest),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      setExecutionResult(data.result);
    } catch (error) {
      console.error("Error executing prompt flow:", error);
      setExecutionError(error instanceof Error ? error.message : String(error));
    }
  };
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Sidebar */}
      <div className="w-64 bg-white border-r p-4">
        <h2 className="text-xl font-bold mb-4">ノード</h2>
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
        <Button onClick={handleAddNode} className="mt-2 w-full">
          <Plus className="mr-2 h-4 w-4" /> ノードを追加
        </Button>
        <Button
          onClick={handleDeleteNode}
          className="mt-4 w-full"
          disabled={
            !selectedNode ||
            selectedNode.id === "start" ||
            selectedNode.id === "end"
          }
        >
          <Trash2 className="mr-2 h-4 w-4" /> ノードを削除
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="mb-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">ワークスペース</h1>
          <Button onClick={handleExecute}>
            <Play className="mr-2 h-4 w-4" /> 実行
          </Button>
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

        {/* API Endpoint Display */}
        {apiEndpoint && (
          <div className="mt-4 p-4 bg-blue-100 border border-blue-300 rounded">
            <p>APIエンドポイント: {apiEndpoint}</p>
          </div>
        )}

        {/* Execution Result Display */}
        {executionResult && (
          <Alert className="mt-4">
            <AlertTitle>実行結果</AlertTitle>
            <AlertDescription>
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(executionResult, null, 2)}
              </pre>
            </AlertDescription>
          </Alert>
        )}

        {/* Execution Error Display */}
        {executionError && (
          <Alert className="mt-4" variant="destructive">
            <AlertTitle>エラー</AlertTitle>
            <AlertDescription>{executionError}</AlertDescription>
          </Alert>
        )}
      </div>

      {/* Right Sidebar */}
      {selectedNode && (
        <div className="w-80 bg-white border-l p-4">
          <h2 className="text-xl font-bold mb-4">ノードプロパティ</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              名前
            </label>
            <Input
              value={selectedNode.data.label}
              onChange={(e) =>
                handleNodePropertyChange("label", e.target.value)
              }
              className="mt-1"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              ノードタイプ
            </label>
            <Select
              onValueChange={(value) =>
                handleNodePropertyChange("nodeType", value)
              }
              defaultValue={selectedNode.data.nodeType}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="ノードタイプを選択" />
              </SelectTrigger>
              <SelectContent>
                {nodeTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {renderNodeConfig()}
        </div>
      )}
    </div>
  );
};

export default PromptFlow;
