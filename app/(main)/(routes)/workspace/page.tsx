"use client";

import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import PromptFlow from "@/components/PromptFlow";

const CustomPage = () => {
  return (
    <DndProvider backend={HTML5Backend}>
      <PromptFlow />
    </DndProvider>
  );
};

export default CustomPage;
