
import React from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FilterState } from "../types";

interface ActiveFilterBadgesProps {
  activeFilters: FilterState;
  onClearFilter: (filterType: keyof FilterState) => void;
  dateRangeDisplay: string;
  setDateRangeDisplay: (display: string) => void;
  defaultDateRange: string;
}

const ActiveFilterBadges: React.FC<ActiveFilterBadgesProps> = ({
  activeFilters,
  onClearFilter,
  dateRangeDisplay,
  setDateRangeDisplay,
  defaultDateRange
}) => {
  return (
    <>
      {activeFilters.source && (
        <Badge 
          variant="secondary" 
          className="flex items-center gap-1 px-2 py-1"
        >
          Source: {activeFilters.source}
          <X 
            className="h-3 w-3 cursor-pointer" 
            onClick={() => onClearFilter("source")} 
          />
        </Badge>
      )}

      {activeFilters.confidenceScore && (
        <Badge 
          variant="secondary" 
          className="flex items-center gap-1 px-2 py-1"
        >
          Confidence: {activeFilters.confidenceScore}
          <X 
            className="h-3 w-3 cursor-pointer" 
            onClick={() => onClearFilter("confidenceScore")} 
          />
        </Badge>
      )}

      {activeFilters.feedback && (
        <Badge 
          variant="secondary" 
          className="flex items-center gap-1 px-2 py-1"
        >
          Feedback: {activeFilters.feedback === "thumbs_up" ? "Thumbs Up" : "Thumbs Down"}
          <X 
            className="h-3 w-3 cursor-pointer" 
            onClick={() => onClearFilter("feedback")} 
          />
        </Badge>
      )}

      {activeFilters.dateRange && (
        <Badge 
          variant="secondary" 
          className="flex items-center gap-1 px-2 py-1"
        >
          Date: {dateRangeDisplay}
          <X 
            className="h-3 w-3 cursor-pointer" 
            onClick={() => {
              onClearFilter("dateRange");
              setDateRangeDisplay(defaultDateRange);
            }} 
          />
        </Badge>
      )}
    </>
  );
};

export default ActiveFilterBadges;
