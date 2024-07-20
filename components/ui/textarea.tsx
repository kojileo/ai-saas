import React, { FC } from "react";

interface TextareaProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
}

const Textarea: FC<TextareaProps> = ({ value, onChange, placeholder }) => (
  <textarea value={value} onChange={onChange} placeholder={placeholder} />
);

export default Textarea;
