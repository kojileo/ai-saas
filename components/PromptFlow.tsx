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
import {
  ChevronRight,
  Plus,
  Save,
  Play,
  Settings,
  Upload,
  MessageSquare,
  FileText,
  GitBranch,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Textarea from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type NodeType = ReactFlowNode & {
  type: string;
  nodeFunction?: "summarize" | "chat" | "branch" | "fileOps";
  inputType?: string;
  outputType?: string;
  config?: any;
};

const initialNodes: NodeType[] = [
  {
    id: "start",
    type: "input",
    data: { label: "開始" },
    position: { x: 250, y: 5 },
  },
  {
    id: "end",
    type: "output",
    data: { label: "終了" },
    position: { x: 250, y: 200 },
  },
];

const initialEdges = [
  { id: "e-start-1", source: "start", target: "1" },
  { id: "e1-end", source: "1", target: "end" },
];

const nodeFunctions = [
  { value: "summarize", label: "ファイル要約" },
  { value: "chat", label: "チャットボット" },
  { value: "branch", label: "条件分岐" },
  { value: "fileOps", label: "ファイル操作" },
];

const PromptFlow = () => {
  const [nodes, setNodes] = useState<NodeType[]>(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<NodeType | null>(null);
  const [newNodeFunction, setNewNodeFunction] = useState<
    "summarize" | "chat" | "branch" | "fileOps"
  >("summarize");
  const [apiEndpoint, setApiEndpoint] = useState("");
  const [executionResult, setExecutionResult] = useState(null);
  const [executionError, setExecutionError] = useState(null);

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

  const handleAddNode = () => {
    const newNodeId = (nodes.length + 1).toString();
    const newNode: NodeType = {
      id: newNodeId,
      data: {
        label:
          nodeFunctions.find((f) => f.value === newNodeFunction)?.label ||
          "新規ノード",
      },
      position: { x: 250, y: nodes.length * 100 },
      type: "default",
      nodeFunction: newNodeFunction,
      inputType: newNodeFunction === "summarize" ? "file" : "text",
      outputType: newNodeFunction === "fileOps" ? "file" : "text",
    };

    const newNodes = [...nodes.slice(0, -1), newNode, nodes[nodes.length - 1]];
    setNodes(newNodes);

    const lastNodeId = nodes[nodes.length - 2].id;
    const newEdges = [
      ...edges.filter((edge) => edge.target !== "end"),
      {
        id: `e${lastNodeId}-${newNodeId}`,
        source: lastNodeId,
        target: newNodeId,
      },
      {
        id: `e${newNodeId}-end`,
        source: newNodeId,
        target: "end",
      },
    ];
    setEdges(newEdges);
  };

  const handleDeleteNode = () => {
    if (
      selectedNode &&
      selectedNode.id !== "start" &&
      selectedNode.id !== "end"
    ) {
      const selectedIndex = nodes.findIndex(
        (node) => node.id === selectedNode.id
      );
      const newNodes = nodes.filter((node) => node.id !== selectedNode.id);

      const newEdges = edges.filter(
        (edge) =>
          edge.source !== selectedNode.id && edge.target !== selectedNode.id
      );
      if (selectedIndex > 0 && selectedIndex < nodes.length - 1) {
        newEdges.push({
          id: `e${nodes[selectedIndex - 1].id}-${nodes[selectedIndex + 1].id}`,
          source: nodes[selectedIndex - 1].id,
          target: nodes[selectedIndex + 1].id,
        });
      }

      setNodes(newNodes);
      setEdges(newEdges);
      setSelectedNode(null);
    }
  };

  const handleNodePropertyChange = (property: string, value: any) => {
    if (selectedNode) {
      const updatedNodes = nodes.map((node) =>
        node.id === selectedNode.id
          ? {
              ...node,
              [property]:
                property === "data" ? { ...node.data, ...value } : value,
            }
          : node
      );
      setNodes(updatedNodes);
      setSelectedNode({
        ...selectedNode,
        [property]:
          property === "data" ? { ...selectedNode.data, ...value } : value,
      });
    }
  };

  const renderNodeConfig = () => {
    if (!selectedNode) return null;

    switch (selectedNode.nodeFunction) {
      case "summarize":
        return (
          <div className="mb-4">
            <Button variant="outline" className="w-full">
              <Upload className="mr-2 h-4 w-4" /> ファイルをアップロード
            </Button>
          </div>
        );
      case "chat":
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              チャットプロンプト
            </label>
            <Textarea
              placeholder="チャットボットの初期プロンプトを入力"
              value={selectedNode.config?.prompt || ""}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                handleNodePropertyChange("config", {
                  ...selectedNode.config,
                  prompt: e.target.value,
                })
              }
            />
          </div>
        );
      case "branch":
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              条件式
            </label>
            <Input
              placeholder="条件式を入力 (例: length > 100)"
              className="mt-1"
              value={selectedNode.config?.condition || ""}
              onChange={(e) =>
                handleNodePropertyChange("config", {
                  ...selectedNode.config,
                  condition: e.target.value,
                })
              }
            />
          </div>
        );
      case "fileOps":
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              操作タイプ
            </label>
            <Select
              onValueChange={(value) =>
                handleNodePropertyChange("config", {
                  ...selectedNode.config,
                  operation: value,
                })
              }
              defaultValue={selectedNode.config?.operation || "read"}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="操作タイプを選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="read">読み込み</SelectItem>
                <SelectItem value="write">書き込み</SelectItem>
                <SelectItem value="append">追記</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );
      default:
        return null;
    }
  };

  const handleExecute = async () => {
    setApiEndpoint("http://localhost:8000/execute");
    setExecutionResult(null);
    setExecutionError(null);

    try {
      const response = await fetch("http://localhost:8000/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nodes, edges }),
      });

      if (!response.ok) {
        throw new Error("API request failed");
      }

      const data = await response.json();
      setExecutionResult(data.result);
    } catch (error) {
      console.error("Error executing prompt flow:", error as Error);

      setExecutionError(
        error instanceof Error ? error.message : (String(error) as any)
      );
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
            } ${node.id === "start" || node.id === "end" ? "font-bold" : ""}`}
            onClick={() => setSelectedNode(node)}
          >
            {node.data.label}
          </div>
        ))}
        <Select
          onValueChange={(value: "summarize" | "chat" | "branch" | "fileOps") =>
            setNewNodeFunction(value)
          }
          defaultValue={newNodeFunction}
        >
          <SelectTrigger className="w-full mb-2">
            <SelectValue placeholder="ノード機能を選択" />
          </SelectTrigger>
          <SelectContent>
            {nodeFunctions.map((func) => (
              <SelectItem key={func.value} value={func.value}>
                {func.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
          <Plus className="mr-2 h-4 w-4" /> ノードを削除
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="mb-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">ワークスペース</h1>
          <div>
            <Button onClick={handleExecute}>
              <Play className="mr-2 h-4 w-4" /> 実行
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
                handleNodePropertyChange("data", {
                  ...selectedNode.data,
                  label: e.target.value,
                })
              }
              className="mt-1"
              disabled={
                selectedNode.id === "start" || selectedNode.id === "end"
              }
            />
          </div>
          {selectedNode.id !== "start" && selectedNode.id !== "end" && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  ノード機能
                </label>
                <Select
                  onValueChange={(
                    value: "summarize" | "chat" | "branch" | "fileOps"
                  ) => handleNodePropertyChange("nodeFunction", value)}
                  defaultValue={selectedNode.nodeFunction}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="ノード機能を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {nodeFunctions.map((func) => (
                      <SelectItem key={func.value} value={func.value}>
                        {func.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {renderNodeConfig()}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PromptFlow;
