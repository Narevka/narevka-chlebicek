
import React from "react";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { FilterState } from "../types";

interface FilterPanelProps {
  filters: FilterState;
  showFilterPanel: boolean;
  availableSources: string[];
  onFilterChange: (filterType: keyof FilterState, value: string | null) => void;
  onTogglePanel: () => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  showFilterPanel,
  availableSources,
  onFilterChange,
  onTogglePanel,
}) => {
  return (
    <>
      <Button 
        variant="outline" 
        size="sm"
        onClick={onTogglePanel}
      >
        <Filter className="h-4 w-4" />
      </Button>

      {showFilterPanel && (
        <div className="mb-4 p-3 border rounded-md bg-gray-50">
          <h3 className="text-sm font-medium mb-3">Filters</h3>
          <div className="space-y-3">
            <div>
              <Label htmlFor="source-filter" className="text-xs">Source</Label>
              <Select 
                value={filters.source || 'all'} 
                onValueChange={(value) => onFilterChange('source', value === 'all' ? null : value)}
              >
                <SelectTrigger id="source-filter" className="h-8 text-xs">
                  <SelectValue placeholder="All sources" />
                </SelectTrigger>
                <SelectContent>
                  {availableSources.map(source => (
                    <SelectItem key={source} value={source} className="text-xs">
                      {source === 'all' ? 'All sources' : source}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="date-filter" className="text-xs">Date</Label>
              <Select 
                value={filters.dateRange || 'all_time'} 
                onValueChange={(value) => onFilterChange('dateRange', value === 'all_time' ? null : value)}
              >
                <SelectTrigger id="date-filter" className="h-8 text-xs">
                  <SelectValue placeholder="All time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_time" className="text-xs">All time</SelectItem>
                  <SelectItem value="last_7_days" className="text-xs">Last 7 days</SelectItem>
                  <SelectItem value="last_30_days" className="text-xs">Last 30 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FilterPanel;
