import { Dropdown, DropdownButton } from "react-bootstrap";

interface NodeDropdownProps {
  handleSelect: (eventKey: string | null) => void;
  createNodes: () => void;
}

const NodeDropdown: React.FC<NodeDropdownProps> = ({
  handleSelect,
  createNodes,
}) => {
  return (
    <div className="flex flex-col items-center space-y-4">
      <DropdownButton
        id="dropdown-basic-button"
        title="ノードを選択"
        onSelect={handleSelect}
        className="mb-4"
        variant="info"
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
  );
};

export default NodeDropdown;
