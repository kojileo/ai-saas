import { Node, Edge } from "react-flow-renderer";

export const initialElements: (Node | Edge)[] = [
  {
    id: "1",
    type: "input",
    data: { label: "Start" },
    position: { x: 50, y: 50 },
  },
  // 他の初期ノードとエッジ
];
