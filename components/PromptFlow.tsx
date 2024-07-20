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
  { value: "input", label: "入力" },
  { value: "output", label: "出力" },
  { value: "prompt", label: "プロンプト" },
  { value: "llmProcess", label: "LLM処理" },
  { value: "textProcess", label: "テキスト処理" },
  { value: "conditionalBranch", label: "条件分岐" },
  { value: "merge", label: "マージ" },
  { value: "loop", label: "ループ" },
  { value: "dataFetch", label: "データ取得" },
  { value: "dataStore", label: "データ保存" },
];

const PromptFlow = () => {
  const [nodes, setNodes] = useState<NodeType[]>(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<NodeType | null>(null);
  const [newNodeFunction, setNewNodeFunction] = useState<
    "summarize" | "chat" | "branch" | "fileOps"
  >("summarize");
  const [apiEndpoint, setApiEndpoint] = useState<string | null>(null);

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
    const newNode: NodeType = {
      id: (nodes.length - 1).toString(),
      data: {
        label:
          nodeFunctions.find((f) => f.value === newNodeFunction)?.label ||
          "新規ノード",
      },
      position: { x: 250, y: (nodes.length - 1) * 100 },
      type: "default",
      nodeFunction: newNodeFunction,
      inputType: newNodeFunction === "summarize" ? "file" : "text",
      outputType: newNodeFunction === "fileOps" ? "file" : "text",
    };

    const newNodes = [...nodes.slice(0, -1), newNode, nodes[nodes.length - 1]];
    setNodes(newNodes);

    const newEdges = [
      ...edges.filter((edge) => edge.target !== "end"),
      {
        id: `e${newNode.id}-${nodes.length - 1}`,
        source: newNode.id,
        target: "end",
      },
      {
        id: `e${nodes.length - 2}-${newNode.id}`,
        source: (nodes.length - 2).toString(),
        target: newNode.id,
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
        node.id === selectedNode.id ? { ...node, [property]: value } : node
      );
      setNodes(updatedNodes);
      setSelectedNode({ ...selectedNode, [property]: value });
    }
  };

  const handleExecute = () => {
    setApiEndpoint("https://api.example.com/execute");
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
      <div className="flex-1 p-4">
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
