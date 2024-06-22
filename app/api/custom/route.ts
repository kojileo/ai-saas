import axios from "axios";

export const uploadPdf = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axios.post(
    "http://127.0.0.1:5000/api/upload_pdf",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

export const askQuestion = async (query: string) => {
  const response = await axios.post(
    "http://127.0.0.1:5000/api/ask",
    { query },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
};
