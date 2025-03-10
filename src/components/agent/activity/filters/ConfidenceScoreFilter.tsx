
import React from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const confidenceScores = [
  "< 0.1",
  "< 0.2",
  "< 0.3",
  "< 0.4",
  "< 0.5",
  "< 0.6",
  "< 0.7",
  "< 0.8",
  "< 0.9",
];

interface ConfidenceScoreFilterProps {
  activeScore: string | null;
  onFilterChange: (value: string | null) => void;
}

const ConfidenceScoreFilter: React.FC<ConfidenceScoreFilterProps> = ({ 
  activeScore, 
  onFilterChange 
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center">
          Confidence score
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem
          className="flex justify-between items-center"
          onClick={() => onFilterChange(null)}
        >
          Show All
          {activeScore === null && <Check className="h-4 w-4" />}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {confidenceScores.map((score) => (
          <DropdownMenuItem
            key={score}
            className="flex justify-between items-center"
            onClick={() => onFilterChange(score)}
          >
            {score}
            {activeScore === score && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ConfidenceScoreFilter;
