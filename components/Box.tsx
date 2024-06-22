import React, { FC } from "react";
import { useDrag, useDrop } from "react-dnd";
import { ItemTypes } from "@/app/constants/ItemTypes";

interface BoxProps {
  id: number;
  text: string;
  width: number;
  height: number;
  top: number;
  left: number;
  moveBox: (id: number, left: number, top: number) => void;
  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
  handleAsk: () => void;
  answer: string;
}

const Box: FC<BoxProps> = ({
  id,
  text,
  width,
  height,
  top,
  left,
  moveBox,
  query,
  setQuery,
  handleAsk,
  answer,
}) => {
  const [, ref] = useDrag({
    type: ItemTypes.BOX,
    item: { id, left, top },
  });

  const [, drop] = useDrop({
    accept: ItemTypes.BOX,
    hover: (item: { id: number; left: number; top: number }, monitor) => {
      const delta = monitor.getDifferenceFromInitialOffset();
      if (delta) {
        const newLeft = Math.round(item.left + delta.x);
        const newTop = Math.round(item.top + delta.y);
        moveBox(item.id, newLeft, newTop);
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
        width,
        height,
      }}
    >
      {text === "チャット入力" ? (
        <div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="入力"
          />
          <button onClick={handleAsk}>クリック</button>
          {answer && <p>回答: {answer}</p>}
        </div>
      ) : text === "応答画面" ? (
        <div>
          <p>回答: {answer}</p>
        </div>
      ) : (
        text
      )}
    </div>
  );
};

export default Box;
