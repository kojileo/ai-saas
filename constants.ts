import { Code, File, MessageSquare } from "lucide-react";

export const MAX_FREE_COUNTS = 5;

export const tools = [
  {
    label: "ファイル要約",
    icon: File,
    href: "/file",
    color: "text-red-500",
    bgColor: "bg-violet-500/10",
  },
  {
    label: "チャットボット",
    icon: MessageSquare,
    href: "/conversation",
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
  },
  {
    label: "コード生成",
    icon: Code,
    color: "text-green-700",
    bgColor: "bg-green-700/10",
    href: "/code",
  },
];
