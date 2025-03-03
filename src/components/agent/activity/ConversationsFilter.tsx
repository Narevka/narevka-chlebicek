
import React from "react";
import { Check, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface ConversationsFilterProps {
  sources: string[];
  activeFilter: string | null;
  onFilterChange: (filter: string | null) => void;
}

const ConversationsFilter = ({ sources, activeFilter, onFilterChange }: ConversationsFilterProps) => {
  const uniqueSources = [...new Set(sources)].sort();

  return (
    <div className="flex items-center space-x-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center">
            <Filter className="h-4 w-4 mr-2" />
            Filter by source
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem
            className="flex justify-between items-center"
            onClick={() => onFilterChange(null)}
          >
            All sources
            {activeFilter === null && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
          {uniqueSources.map((source) => (
            <DropdownMenuItem
              key={source}
              className="flex justify-between items-center"
              onClick={() => onFilterChange(source)}
            >
              {source}
              {activeFilter === source && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {activeFilter && (
        <Badge 
          variant="secondary" 
          className="flex items-center gap-1 px-2 py-1"
        >
          {activeFilter}
          <X 
            className="h-3 w-3 cursor-pointer" 
            onClick={() => onFilterChange(null)} 
          />
        </Badge>
      )}
    </div>
  );
};

export default ConversationsFilter;
