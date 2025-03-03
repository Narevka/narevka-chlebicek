
import React, { useState } from "react";
import { Calendar, Check, ChevronLeft, ChevronRight, Filter, ThumbsDown, ThumbsUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger 
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface FilterState {
  source: string | null;
  confidenceScore: string | null;
  feedback: string | null;
  dateRange: string | null;
}

interface ConversationsFilterProps {
  sources: string[];
  activeFilters: FilterState;
  onFilterChange: (filterType: keyof FilterState, value: string | null) => void;
}

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

const feedbackOptions = [
  { id: "thumbs_down", label: "Contains thumbs down", icon: <ThumbsDown className="h-4 w-4 mr-2" /> },
  { id: "thumbs_up", label: "Contains thumbs Up", icon: <ThumbsUp className="h-4 w-4 mr-2" /> },
];

const dateRangeOptions = [
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "last_7_days", label: "Last 7 days" },
  { id: "last_30_days", label: "Last 30 days" },
  { id: "this_month", label: "This month" },
  { id: "last_month", label: "Last month" },
];

const ConversationsFilter = ({ sources, activeFilters, onFilterChange }: ConversationsFilterProps) => {
  const uniqueSources = [...new Set(sources)].sort();
  
  // Get dates for default date range display
  const today = new Date();
  const monthFromNow = new Date();
  monthFromNow.setMonth(monthFromNow.getMonth() + 1);
  
  const formattedDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };
  
  const defaultDateRange = `${formattedDate(today)} ~ ${formattedDate(monthFromNow)}`;
  const [dateRangeDisplay, setDateRangeDisplay] = useState(activeFilters.dateRange || defaultDateRange);

  // Clear a specific filter
  const clearFilter = (filterType: keyof FilterState) => {
    onFilterChange(filterType, null);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Source Filter */}
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
            onClick={() => onFilterChange("source", null)}
          >
            Show All
            {activeFilters.source === null && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {uniqueSources.map((source) => (
            <DropdownMenuItem
              key={source}
              className="flex justify-between items-center"
              onClick={() => onFilterChange("source", source)}
            >
              {source}
              {activeFilters.source === source && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Confidence Score Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center">
            Confidence score
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem
            className="flex justify-between items-center"
            onClick={() => onFilterChange("confidenceScore", null)}
          >
            Show All
            {activeFilters.confidenceScore === null && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {confidenceScores.map((score) => (
            <DropdownMenuItem
              key={score}
              className="flex justify-between items-center"
              onClick={() => onFilterChange("confidenceScore", score)}
            >
              {score}
              {activeFilters.confidenceScore === score && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Feedback Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center">
            Feedback
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem
            className="flex justify-between items-center"
            onClick={() => onFilterChange("feedback", null)}
          >
            Show All
            {activeFilters.feedback === null && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {feedbackOptions.map((option) => (
            <DropdownMenuItem
              key={option.id}
              className="flex justify-between items-center"
              onClick={() => onFilterChange("feedback", option.id)}
            >
              <div className="flex items-center">
                {option.icon}
                {option.label}
              </div>
              {activeFilters.feedback === option.id && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Date Range Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            {dateRangeDisplay}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex">
            {/* Quick date ranges */}
            <div className="border-r p-2 space-y-1 w-40">
              {dateRangeOptions.map((option) => (
                <Button
                  key={option.id}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    activeFilters.dateRange === option.id && "bg-purple-100 text-purple-800"
                  )}
                  onClick={() => {
                    onFilterChange("dateRange", option.id);
                    setDateRangeDisplay(option.label);
                  }}
                >
                  {option.label}
                </Button>
              ))}
            </div>
            
            {/* Calendar pickers would go here */}
            <div className="p-2 space-y-2">
              <div className="flex">
                <Button size="sm" variant="ghost" className="px-2">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex-1 text-center font-medium">MAR 2025</div>
                <Button size="sm" variant="ghost" className="px-2">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              {/* Calendar placeholder - in a real implementation, we would use a date picker component */}
              <div className="grid grid-cols-7 text-center gap-1">
                <div className="text-xs text-gray-500">Sun</div>
                <div className="text-xs text-gray-500">Mon</div>
                <div className="text-xs text-gray-500">Tue</div>
                <div className="text-xs text-gray-500">Wed</div>
                <div className="text-xs text-gray-500">Thu</div>
                <div className="text-xs text-gray-500">Fri</div>
                <div className="text-xs text-gray-500">Sat</div>
                {/* Calendar days would go here */}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Active filter badges */}
      {activeFilters.source && (
        <Badge 
          variant="secondary" 
          className="flex items-center gap-1 px-2 py-1"
        >
          Source: {activeFilters.source}
          <X 
            className="h-3 w-3 cursor-pointer" 
            onClick={() => clearFilter("source")} 
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
            onClick={() => clearFilter("confidenceScore")} 
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
            onClick={() => clearFilter("feedback")} 
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
              clearFilter("dateRange");
              setDateRangeDisplay(defaultDateRange);
            }} 
          />
        </Badge>
      )}
    </div>
  );
};

export default ConversationsFilter;
