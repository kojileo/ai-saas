import React, { useState } from "react";
import { Button, Dropdown, DropdownButton } from "react-bootstrap"; // react-bootstrapを使用

interface NodeActionsProps {
  onAddNode: () => void;
  onRemoveLastNode: () => void;
  onResetElements: () => void;
  onAddEndNode: () => void;
  onCreateNodes: (labels: string[]) => void;
}

const NodeActions: React.FC<NodeActionsProps> = ({
  onAddNode,
  onRemoveLastNode,
  onResetElements,
  onAddEndNode,
  onCreateNodes,
}) => {
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSelect = (eventKey: string | null) => {
    if (eventKey && !selectedLabels.includes(eventKey)) {
      setSelectedLabels((prev) => [...prev, eventKey]);
    }
  };

  const createNodes = () => {
    setShowDropdown(false);
    onCreateNodes(selectedLabels);
    setSelectedLabels([]);
  };

  return (
    <div>
      <button
        onClick={() => setShowDropdown(true)}
        className="mb-4 p-2 bg-blue-500 text-white rounded"
      >
        ノード作成の準備
      </button>
      {showDropdown && (
        <div className="flex flex-col items-center space-y-4">
          <DropdownButton
            id="dropdown-basic-button"
            title="ノードを選択"
            onSelect={handleSelect}
            className="mb-4"
          >
            <Dropdown.Item eventKey="ファイル入力">ファイル入力</Dropdown.Item>
            <Dropdown.Item eventKey="ファイル要約AIモデル">
              ファイル要約AIモデル
            </Dropdown.Item>
          </DropdownButton>
          <button
            onClick={createNodes}
            className="p-2 bg-blue-500 text-white rounded"
          >
            ノードを作成
          </button>
        </div>
      )}
      <div className="flex justify-center space-x-4 mb-4">
        <button
          onClick={onRemoveLastNode}
          className="p-2 bg-red-500 text-white rounded"
        >
          最新のノードを削除
        </button>
        <button
          onClick={onResetElements}
          className="p-2 bg-gray-500 text-white rounded"
        >
          初期化
        </button>
        <button
          onClick={onAddEndNode}
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
    </div>
  );
};

export default NodeActions;
