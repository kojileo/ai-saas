import React, { FC } from "react";
import { useDrag, useDrop } from "react-dnd";
import { ItemTypes } from "@/app/constants/ItemTypes";

interface FileInputProps {
  id: number;
  top: number;
  left: number;
  moveFileInput: (id: number, left: number, top: number) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleUpload: () => void;
}

const FileInput: FC<FileInputProps> = ({
  id,
  top,
  left,
  moveFileInput,
  handleFileChange,
  handleUpload,
}) => {
  const [, ref] = useDrag({
    type: ItemTypes.FILE_INPUT,
    item: { id, left, top },
  });

  const [, drop] = useDrop({
    accept: ItemTypes.FILE_INPUT,
    hover: (item: { id: number; left: number; top: number }, monitor) => {
      const delta = monitor.getDifferenceFromInitialOffset();
      if (delta) {
        const newLeft = Math.round(item.left + delta.x);
        const newTop = Math.round(item.top + delta.y);
        moveFileInput(item.id, newLeft, newTop);
      }
    },
  });

  return (
    <div
      ref={(node) => ref(drop(node))}
      style={{
        position: "absolute",
        top,
        left,
        padding: "8px",
        border: "1px solid black",
        backgroundColor: "white",
      }}
    >
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>アップロード</button>
    </div>
  );
};

export default FileInput;
