
import React from "react";
import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  if (!status || status === 'crawling') {
    return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Crawling</Badge>;
  } else if (status === 'completed') {
    return <Badge variant="outline" className="bg-green-100 text-green-800">Completed</Badge>;
  } else if (status === 'error') {
    return <Badge variant="outline" className="bg-red-100 text-red-800">Error</Badge>;
  }
  return null;
};

export default StatusBadge;
