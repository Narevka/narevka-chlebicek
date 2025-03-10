
import { FilterState } from "../types";

export const applyFiltersToQuery = (query: any, filters: FilterState) => {
  let filteredQuery = query;
  
  // Source filter
  if (filters.source && filters.source !== 'all') {
    filteredQuery = filteredQuery.eq('source', filters.source);
  }
  
  // Date range filter
  if (filters.dateRange) {
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);
    
    if (filters.dateRange === "last_7_days") {
      filteredQuery = filteredQuery.gte('created_at', sevenDaysAgo.toISOString());
    }
    // Add more date range options here if needed
  }
  
  return filteredQuery;
};
