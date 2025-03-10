
import React, { useState } from "react";
import { FilterState } from "./types";
import SourceFilter from "./filters/SourceFilter";
import ConfidenceScoreFilter from "./filters/ConfidenceScoreFilter";
import FeedbackFilter from "./filters/FeedbackFilter";
import DateRangeFilter from "./filters/DateRangeFilter";
import ActiveFilterBadges from "./filters/ActiveFilterBadges";

interface ConversationsFilterProps {
  sources: string[];
  activeFilters: FilterState;
  onFilterChange: (filterType: keyof FilterState, value: string | null) => void;
}

const ConversationsFilter = ({ sources, activeFilters, onFilterChange }: ConversationsFilterProps) => {
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
      <SourceFilter 
        sources={sources}
        activeSource={activeFilters.source}
        onFilterChange={(value) => onFilterChange("source", value)}
      />

      {/* Confidence Score Filter */}
      <ConfidenceScoreFilter 
        activeScore={activeFilters.confidenceScore}
        onFilterChange={(value) => onFilterChange("confidenceScore", value)}
      />

      {/* Feedback Filter */}
      <FeedbackFilter 
        activeFeedback={activeFilters.feedback}
        onFilterChange={(value) => onFilterChange("feedback", value)}
      />

      {/* Date Range Filter */}
      <DateRangeFilter 
        activeDateRange={activeFilters.dateRange}
        onFilterChange={(value) => onFilterChange("dateRange", value)}
      />

      {/* Active filter badges */}
      <ActiveFilterBadges 
        activeFilters={activeFilters}
        onClearFilter={clearFilter}
        dateRangeDisplay={dateRangeDisplay}
        setDateRangeDisplay={setDateRangeDisplay}
        defaultDateRange={defaultDateRange}
      />
    </div>
  );
};

export default ConversationsFilter;
