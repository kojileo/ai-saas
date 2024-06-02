"use client";
import Link from "next/link";
import Image from "next/image";
import { Montserrat } from "next/font/google";
import { usePathname } from "next/navigation";
import { LayoutDashboard, File, MessageSquare, Code } from "lucide-react";

import { cn } from "@/lib/utils";

const montserrat = Montserrat({ weight: "600", subsets: ["latin"] });

const routes = [
  {
    label: "ワークスペース",
    icon: LayoutDashboard,
    href: "/dashboard",
    color: "text-sky-500",
  },
  {
    label: "ファイル要約",
    icon: File,
    href: "/file",
    color: "text-red-500",
  },
  {
    label: "チャットボット",
    icon: MessageSquare,
    href: "/conversation",
    color: "text-violet-500",
  },
  {
    label: "コード生成",
    icon: Code,
    href: "/code",
    color: "text-green-700",
  },
];

const Sidebar = () => {
  const pathname = usePathname();
  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-[#111827] text-white">
      <div className="px-3 py-2 flex-1">
        <Link href="/dashboard" passHref>
          <div className="flex items-center pl-3 mb-14">
            <div className="relative w-8 h-8 mr-4">
              <Image alt="logo" src="/logo.png" width={32} height={32} />{" "}
            </div>
            <h1 className={cn("text-2xl font-bold", montserrat.className)}>
              AI platform
            </h1>
          </div>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              href={route.href}
              key={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium  cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                pathname === route.href
                  ? "text-white bg-white/10"
                  : "text-zinc-400"
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
