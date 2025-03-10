
import { WebsiteSourceItem } from "../../WebsiteItem";

/**
 * Load deleted source IDs from localStorage
 */
export const loadDeletedSourceIds = (deletedSourcesKey: string): Set<string> => {
  const storedDeletedIds = localStorage.getItem(deletedSourcesKey);
  if (!storedDeletedIds) return new Set();
  
  try {
    const parsedIds = JSON.parse(storedDeletedIds);
    return new Set(parsedIds);
  } catch (e) {
    console.error("Error parsing deleted source IDs:", e);
    return new Set();
  }
};

/**
 * Save website sources to localStorage
 */
export const saveWebsiteSources = (
  localStorageKey: string, 
  websiteSources: WebsiteSourceItem[]
): void => {
  if (websiteSources.length > 0) {
    localStorage.setItem(localStorageKey, JSON.stringify(websiteSources));
  } else {
    localStorage.removeItem(localStorageKey);
  }
};

/**
 * Clear deleted sources from localStorage
 */
export const clearDeletedSources = (deletedSourcesKey: string): void => {
  localStorage.removeItem(deletedSourcesKey);
};
