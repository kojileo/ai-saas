"use client";

import { useEffect } from "react";
import { Crisp } from "crisp-sdk-web";

export const CrispChat = () => {
  useEffect(() => {
    Crisp.configure("e3b529fb-5492-4e1a-b321-61d691bb7eb7");
  }, []);

  return null;
};
