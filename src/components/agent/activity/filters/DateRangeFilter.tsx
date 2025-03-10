
import React, { useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger 
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const dateRangeOptions = [
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "last_7_days", label: "Last 7 days" },
  { id: "last_30_days", label: "Last 30 days" },
  { id: "this_month", label: "This month" },
  { id: "last_month", label: "Last month" },
];

interface DateRangeFilterProps {
  activeDateRange: string | null;
  onFilterChange: (value: string | null) => void;
}

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({ 
  activeDateRange, 
  onFilterChange 
}) => {
  // Get dates for default date range display
  const today = new Date();
  const monthFromNow = new Date();
  monthFromNow.setMonth(monthFromNow.getMonth() + 1);
  
  const formattedDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };
  
  const defaultDateRange = `${formattedDate(today)} ~ ${formattedDate(monthFromNow)}`;
  const [dateRangeDisplay, setDateRangeDisplay] = useState(activeDateRange || defaultDateRange);

  return (
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
                  activeDateRange === option.id && "bg-purple-100 text-purple-800"
                )}
                onClick={() => {
                  onFilterChange(option.id);
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
  );
};

export default DateRangeFilter;
