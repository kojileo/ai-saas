import React, { useState } from "react";
import Box from "@/components/Box";
import FileInput from "@/components/FileInput";
import { uploadPdf, askQuestion } from "@/app/api/custom/route";

// BoxProps と FileInputProps の型定義を追加
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

interface FileInputProps {
  id: number;
  top: number;
  left: number;
  moveFileInput: (id: number, left: number, top: number) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleUpload: () => void;
}

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
      query: query,
      setQuery: setQuery,
      handleAsk: handleAskWrapper,
      answer: answer,
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

  const handleAsk = async (
    query: string,
    setAnswer: React.Dispatch<React.SetStateAction<string>>
  ) => {
    const response = await askQuestion(query);
    setAnswer(response.answer.result);
  };

  const handleAskWrapper = async () => {
    await handleAsk(query, (response) => {
      setAnswer(JSON.stringify(response)); // オブジェクトを文字列に変換
    });
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
          query={query}
          setQuery={setQuery}
          handleAsk={handleAskWrapper}
          answer={answer}
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
    </div>
  );
};

export default Container;
