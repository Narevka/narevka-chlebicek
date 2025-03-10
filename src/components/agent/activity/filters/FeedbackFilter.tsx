
import React from "react";
import { Check, ThumbsDown, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const feedbackOptions = [
  { id: "thumbs_down", label: "Contains thumbs down", icon: <ThumbsDown className="h-4 w-4 mr-2" /> },
  { id: "thumbs_up", label: "Contains thumbs Up", icon: <ThumbsUp className="h-4 w-4 mr-2" /> },
];

interface FeedbackFilterProps {
  activeFeedback: string | null;
  onFilterChange: (value: string | null) => void;
}

const FeedbackFilter: React.FC<FeedbackFilterProps> = ({ 
  activeFeedback, 
  onFilterChange 
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center">
          Feedback
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem
          className="flex justify-between items-center"
          onClick={() => onFilterChange(null)}
        >
          Show All
          {activeFeedback === null && <Check className="h-4 w-4" />}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {feedbackOptions.map((option) => (
          <DropdownMenuItem
            key={option.id}
            className="flex justify-between items-center"
            onClick={() => onFilterChange(option.id)}
          >
            <div className="flex items-center">
              {option.icon}
              {option.label}
            </div>
            {activeFeedback === option.id && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default FeedbackFilter;
