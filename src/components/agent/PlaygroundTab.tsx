
import React from "react";
import { Button } from "@/components/ui/button";
import ChatInterface from "./ChatInterface";

interface PlaygroundTabProps {
  agentName: string;
}

const PlaygroundTab = ({ agentName }: PlaygroundTabProps) => {
  return (
    <div className="mt-6">
      <div className="flex items-center mb-6">
        <h1 className="text-2xl font-bold">Playground</h1>
        <span className="ml-2 text-muted-foreground">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        </span>
        <div className="ml-auto">
          <Button variant="outline">Compare</Button>
        </div>
      </div>

      <ChatInterface agentName={agentName} />
    </div>
  );
};

export default PlaygroundTab;
