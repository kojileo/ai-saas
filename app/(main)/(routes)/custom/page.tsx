"use client";

import React, { useState, FC } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const ItemTypes = {
  BOX: "box",
};

interface BoxProps {
  id: number;
  text: string;
  width: number;
  height: number;
  top: number;
  left: number;
  moveBox: (id: number, left: number, top: number) => void;
}

const Box: FC<BoxProps> = ({ id, text, width, height, top, left, moveBox }) => {
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
      {text}
    </div>
  );
};

const Container = () => {
  const [boxes, setBoxes] = useState<BoxProps[]>([]); // 型を明示的に指定
  const [showPopup, setShowPopup] = useState(false);
  const [newBoxSize, setNewBoxSize] = useState({
    width: 100,
    height: 100,
    top: 0,
    left: 0,
  });
  const [newBoxText, setNewBoxText] = useState("チャット入力");

  const moveBox = (id: number, left: number, top: number) => {
    setBoxes((prevBoxes) =>
      prevBoxes.map((box) => (box.id === id ? { ...box, left, top } : box))
    );
  };

  const addBox = () => {
    const newId = boxes.length ? boxes[boxes.length - 1].id + 1 : 1;
    const newBox: BoxProps = {
      id: newId,
      text: newBoxText,
      ...newBoxSize,
      moveBox: moveBox, // moveBox added
    };
    setBoxes([...boxes, newBox]);
    setShowPopup(false);
  };

  const removeBox = () => {
    setBoxes(boxes.slice(0, -1));
  };

  return (
    <div style={{ position: "relative", height: "100vh" }}>
      {boxes.map((box) => (
        <Box
          key={box.id}
          id={box.id}
          text={box.text}
          width={box.width}
          height={box.height}
          top={box.top}
          left={box.left}
          moveBox={moveBox}
        />
      ))}
      <div style={{ position: "fixed", bottom: "10px", left: "300px" }}>
        <button
          onClick={() => setShowPopup(true)}
          style={{ marginRight: "5px" }}
        >
          +
        </button>
        <button onClick={removeBox}>-</button>
      </div>
      {showPopup && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            padding: "20px",
            backgroundColor: "white",
            border: "1px solid black",
          }}
        >
          <h3>新しいBoxのサイズと位置を設定</h3>
          <label>
            幅:
            <input
              type="number"
              value={newBoxSize.width}
              onChange={(e) =>
                setNewBoxSize({
                  ...newBoxSize,
                  width: parseInt(e.target.value),
                })
              }
            />
          </label>
          <br />
          <label>
            高さ:
            <input
              type="number"
              value={newBoxSize.height}
              onChange={(e) =>
                setNewBoxSize({
                  ...newBoxSize,
                  height: parseInt(e.target.value),
                })
              }
            />
          </label>
          <br />
          <label>
            上:
            <input
              type="number"
              value={newBoxSize.top}
              onChange={(e) =>
                setNewBoxSize({ ...newBoxSize, top: parseInt(e.target.value) })
              }
            />
          </label>
          <br />
          <label>
            左:
            <input
              type="number"
              value={newBoxSize.left}
              onChange={(e) =>
                setNewBoxSize({ ...newBoxSize, left: parseInt(e.target.value) })
              }
            />
          </label>
          <br />
          <label>
            テキスト:
            <select
              value={newBoxText}
              onChange={(e) => setNewBoxText(e.target.value)}
            >
              <option value="チャット入力">チャット入力</option>
              <option value="ファイル入力">ファイル入力</option>
              <option value="応答画面">応答画面</option>
            </select>
          </label>
          <br />
          <button
            onClick={addBox}
            style={{
              backgroundColor: "green",
              color: "white",
              marginRight: "10px",
            }}
          >
            追加
          </button>
          <button
            onClick={() => setShowPopup(false)}
            style={{ backgroundColor: "red", color: "white" }}
          >
            キャンセル
          </button>
        </div>
      )}
    </div>
  );
};

const CustomPage = () => {
  return (
    <DndProvider backend={HTML5Backend}>
      <Container />
    </DndProvider>
  );
};

export default CustomPage;
