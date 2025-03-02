
import React from "react";
import { MessageSquare } from "lucide-react";

const ActivityTab = () => {
  return (
    <div className="p-6 text-center">
      <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
      <h3 className="text-lg font-medium">Activity Log</h3>
      <p className="text-muted-foreground">View all conversations with this agent.</p>
    </div>
  );
};

export default ActivityTab;
