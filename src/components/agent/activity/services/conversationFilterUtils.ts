
import { FilterState } from "../types";

export const applyFiltersToQuery = (query: any, filters: FilterState, searchTerm?: string) => {
  let filteredQuery = query;

  // Source filter
  if (filters.source && filters.source !== 'all') {
    // Apply exact matching for filtering by source
    filteredQuery = filteredQuery.eq('source', filters.source);
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

  // Search term filter
  if (searchTerm && searchTerm.trim() !== '') {
    filteredQuery = filteredQuery.ilike('content', `%${searchTerm}%`);
  }

  return filteredQuery;
};
