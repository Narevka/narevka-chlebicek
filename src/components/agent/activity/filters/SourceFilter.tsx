
import React from "react";
import { Check, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface SourceFilterProps {
  sources: string[];
  activeSource: string | null;
  onFilterChange: (value: string | null) => void;
}

const SourceFilter: React.FC<SourceFilterProps> = ({ 
  sources, 
  activeSource, 
  onFilterChange 
}) => {
  const uniqueSources = [...new Set(sources)].sort();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center">
          <Filter className="h-4 w-4 mr-2" />
          Source
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem
          className="flex justify-between items-center"
          onClick={() => onFilterChange(null)}
        >
          Show All
          {activeSource === null && <Check className="h-4 w-4" />}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {uniqueSources.map((source) => (
          <DropdownMenuItem
            key={source}
            className="flex justify-between items-center"
            onClick={() => onFilterChange(source)}
          >
            {source}
            {activeSource === source && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SourceFilter;
