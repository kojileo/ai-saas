"use client";

import React, { useState, FC } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { uploadPdf, askQuestion } from "@/app/api/custom/route";

const ItemTypes = {
  BOX: "box",
  FILE_INPUT: "fileInput",
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

interface FileInputProps {
  id: number;
  top: number;
  left: number;
  moveFileInput: (id: number, left: number, top: number) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleUpload: () => void;
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

const Container = () => {
  const [boxes, setBoxes] = useState<BoxProps[]>([]);
  const [fileInputs, setFileInputs] = useState<FileInputProps[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [newBoxSize, setNewBoxSize] = useState({
    width: 100,
    height: 100,
    top: 0,
    left: 0,
  });
  const [newBoxText, setNewBoxText] = useState("チャット入力");
  const [file, setFile] = useState<File | null>(null);
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");

  const moveBox = (id: number, left: number, top: number) => {
    setBoxes((prevBoxes) =>
      prevBoxes.map((box) => (box.id === id ? { ...box, left, top } : box))
    );
  };

  const moveFileInput = (id: number, left: number, top: number) => {
    setFileInputs((prevFileInputs) =>
      prevFileInputs.map((fileInput) =>
        fileInput.id === id ? { ...fileInput, left, top } : fileInput
      )
    );
  };

  const addBox = () => {
    const newId = boxes.length ? boxes[boxes.length - 1].id + 1 : 1;
    const newBox: BoxProps = {
      id: newId,
      text: newBoxText,
      ...newBoxSize,
      moveBox: moveBox,
    };
    setBoxes([...boxes, newBox]);
    setShowPopup(false);
  };

  const addFileInput = () => {
    const newId = fileInputs.length
      ? fileInputs[fileInputs.length - 1].id + 1
      : 1;
    const newFileInput: FileInputProps = {
      id: newId,
      top: 0,
      left: 0,
      moveFileInput: moveFileInput,
      handleFileChange: handleFileChange,
      handleUpload: handleUpload,
    };
    setFileInputs([...fileInputs, newFileInput]);
    setShowPopup(false);
  };

  const removeBox = () => {
    setBoxes(boxes.slice(0, -1));
  };

  const removeFileInput = () => {
    setFileInputs(fileInputs.slice(0, -1));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (file) {
      const response = await uploadPdf(file);
      console.log(response);
    }
  };

  const handleAsk = async () => {
    const response = await askQuestion(query);
    setAnswer(response.answer.result);
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
      {fileInputs.map((fileInput) => (
        <FileInput
          key={fileInput.id}
          id={fileInput.id}
          top={fileInput.top}
          left={fileInput.left}
          moveFileInput={moveFileInput}
          handleFileChange={fileInput.handleFileChange}
          handleUpload={fileInput.handleUpload}
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
        <button onClick={addFileInput} style={{ marginLeft: "5px" }}>
          ファイル入力追加
        </button>
        <button onClick={removeFileInput}>ファイル入力削除</button>
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
                setNewBoxSize({
                  ...newBoxSize,
                  left: parseInt(e.target.value),
                })
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
            onClick={newBoxText === "ファイル入力" ? addFileInput : addBox}
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
      {newBoxText === "ファイル入力" && (
        <div style={{ position: "fixed", bottom: "10px", right: "10px" }}>
          <input type="file" onChange={handleFileChange} />
          <button onClick={handleUpload}>アップロード</button>
        </div>
      )}
      {newBoxText === "チャット入力" && (
        <div style={{ position: "fixed", bottom: "50px", right: "10px" }}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="質問を入力してください"
          />
          <button onClick={handleAsk}>質問する</button>
          {answer && <p>回答: {answer}</p>}
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
