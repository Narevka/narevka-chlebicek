
import React from "react";
import { RefreshCw, Download, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import FilterPanel from "./FilterPanel";
import { FilterState } from "../types";

interface HeaderActionsProps {
  onRefresh: () => void;
  filters: FilterState;
  showFilterPanel: boolean;
  availableSources: string[];
  onFilterChange: (filterType: keyof FilterState, value: string | null) => void;
  onToggleFilterPanel: () => void;
  onExport: (format: string) => void;
}

const HeaderActions: React.FC<HeaderActionsProps> = ({
  onRefresh,
  filters,
  showFilterPanel,
  availableSources,
  onFilterChange,
  onToggleFilterPanel,
  onExport,
}) => {
  return (
    <div className="flex space-x-2">
      <Button 
        variant="outline" 
        size="sm"
        onClick={onRefresh}
      >
        <RefreshCw className="h-4 w-4" />
      </Button>
      
      <FilterPanel
        filters={filters}
        showFilterPanel={showFilterPanel}
        availableSources={availableSources}
        onFilterChange={onFilterChange}
        onTogglePanel={onToggleFilterPanel}
      />
      
      <Button 
        variant="default" 
        size="sm"
        className="bg-black text-white hover:bg-gray-800"
        onClick={() => onExport('csv')}
      >
        <Download className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default HeaderActions;
