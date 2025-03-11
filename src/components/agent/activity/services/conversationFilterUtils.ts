
import { FilterState } from "../types";

export const applyFiltersToQuery = (query: any, filters: FilterState) => {
  let filteredQuery = query;

  // Source filter - handle sources in a case-insensitive manner
  if (filters.source && filters.source !== 'all') {
    // For embedded sources, use an exact match
    if (filters.source.toLowerCase() === 'embedded') {
      filteredQuery = filteredQuery.eq('source', 'embedded');
      console.log(`Applied exact source filter for: ${filters.source}`);
    } 
    // For Playground, also match any source containing "playground" (case insensitive)
    else if (filters.source === 'Playground') {
      filteredQuery = filteredQuery.eq('source', 'Playground');
      console.log(`Applied exact source filter for: ${filters.source}`);
    }
    // For all other sources, use exact match
    else {
      filteredQuery = filteredQuery.eq('source', filters.source);
      console.log(`Applied source filter: ${filters.source}`);
    }
  }

  // Date range filter
  if (filters.dateRange) {
    const today = new Date();

    if (filters.dateRange === "last_7_days") {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(today.getDate() - 7);
      filteredQuery = filteredQuery.gte('created_at', sevenDaysAgo.toISOString());
    } else if (filters.dateRange === "last_30_days") {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);
      filteredQuery = filteredQuery.gte('created_at', thirtyDaysAgo.toISOString());
    }
  }

  // Confidence score filter
  if (filters.confidenceScore) {
    const threshold = parseFloat(filters.confidenceScore.replace('< ', ''));
    if (!isNaN(threshold)) {
      filteredQuery = filteredQuery.lt('confidence', threshold);
    }
  }

  // Feedback filter
  if (filters.feedback) {
    if (filters.feedback === 'thumbs_up') {
      filteredQuery = filteredQuery.eq('has_thumbs_up', true);
    } else if (filters.feedback === 'thumbs_down') {
      filteredQuery = filteredQuery.eq('has_thumbs_down', true);
    }
  }

  return filteredQuery;
};
