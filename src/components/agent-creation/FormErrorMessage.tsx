
import React from "react";
import { AlertCircle } from "lucide-react";

interface FormErrorMessageProps {
  message: string;
}

const FormErrorMessage: React.FC<FormErrorMessageProps> = ({ message }) => {
  if (!message) return null;
  
  return (
    <div className="flex items-center gap-1.5 mt-1.5 text-red-500 text-xs">
      <AlertCircle className="h-3.5 w-3.5" />
      <span>{message}</span>
    </div>
  );
};

export default FormErrorMessage;
