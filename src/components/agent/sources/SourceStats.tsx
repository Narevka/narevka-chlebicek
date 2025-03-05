
import React from "react";
import { Button } from "@/components/ui/button";

const SourceStats = () => {
  return (
    <div>
      <h3 className="text-xl font-bold text-center mb-6">Sources</h3>
      
      <div className="space-y-2 mb-6">
        <p className="text-gray-700">7 Links (20,729 detected chars)</p>
      </div>
      
      <div className="space-y-1 mb-6">
        <p className="font-medium">Total detected characters</p>
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold">20,729</span>
          <span className="text-gray-500">/ 400,000 limit</span>
        </div>
      </div>
      
      <Button className="w-full bg-black hover:bg-gray-800 text-white">
        Retrain agent
      </Button>
    </div>
  );
};

export default SourceStats;
