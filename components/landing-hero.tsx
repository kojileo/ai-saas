"use client";

import TypewriterComponent from "typewriter-effect";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const LandingHero = () => {
  return (
    <div className="text-white font-bold py-36 text-center space-y-5">
      <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl space-y-5 font-extrabold">
        <h1>AIアプリ開発プラットフォーム</h1>
        <div className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          <TypewriterComponent
            options={{
              strings: ["チャットボット.", "ファイル要約.", "コード作成."],
              autoStart: true,
              loop: true,
            }}
          />
        </div>
      </div>
      <div>
        <Link href={"/workspace"}>
          <Button className="md:text-lg p-4 md:p-6 rounded-full font-semibold">
            始める
          </Button>
        </Link>
      </div>
    </div>
  );
};
