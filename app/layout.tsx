import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ModalProvider } from "@/components/modal-provider";
import { ToasterProvider } from "@/components/toaster-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AIプロットフォーム",
  description: "AI Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ModalProvider />
        <ToasterProvider />
        {children}
      </body>
    </html>
  );
}
