
import React from "react";
import { Calendar } from "lucide-react";

interface DateDisplayProps {
  timestamp?: string;
}

const DateDisplay: React.FC<DateDisplayProps> = ({
  timestamp
}) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown date";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="flex items-center text-xs text-gray-500">
      <Calendar className="h-3 w-3 mr-1" />
      {timestamp ? formatDate(timestamp) : "Just now"}
    </div>
  );
};

export default DateDisplay;
