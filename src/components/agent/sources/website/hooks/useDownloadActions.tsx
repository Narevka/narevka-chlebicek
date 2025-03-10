
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useDownloadActions = () => {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownloadContent = async (sourceId: string, url: string) => {
    if (!sourceId) {
      toast.error("No source ID to download");
      return;
    }

    setDownloadingId(sourceId);
    
    try {
      const { data, error } = await supabase
        .from("agent_sources")
        .select("content")
        .eq("id", sourceId)
        .single();

      if (error) {
        throw error;
      }

      if (!data || !data.content) {
        toast.error("No content found for this website");
        return;
      }

      // Parse content
      let content = "";
      try {
        const parsedContent = JSON.parse(data.content);
        
        // Check if we have the crawled_content field (combined content)
        if (parsedContent.crawled_content) {
          content = parsedContent.crawled_content;
        } 
        // Otherwise try to extract content from Firecrawl format
        else if (parsedContent.crawledUrls && Array.isArray(parsedContent.crawledUrls)) {
          // Get domain name for the filename
          const domain = new URL(url).hostname;
          
          // Format crawled pages information
          content = `# Crawled content from ${url}\n\n`;
          content += `Total pages crawled: ${parsedContent.crawledUrls.length}\n`;
          content += `Crawl date: ${new Date(parsedContent.completedAt || Date.now()).toLocaleString()}\n\n`;
          
          // Include URLs that were crawled
          content += "## Pages crawled:\n";
          parsedContent.crawledUrls.forEach((pageUrl: string) => {
            content += `- ${pageUrl}\n`;
          });
          
          // If we have page_content array with actual page content
          if (parsedContent.page_content && Array.isArray(parsedContent.page_content)) {
            content += "\n\n## Page Contents:\n\n";
            parsedContent.page_content.forEach((page: any, index: number) => {
              content += `\n\n### [Page ${index + 1}] ${page.url}\n\n`;
              content += page.content || "No content available";
              content += "\n\n---\n\n";
            });
          }
          // If we have individual pages format (newer Firecrawl format)
          else if (parsedContent.pages && Array.isArray(parsedContent.pages)) {
            content += "\n\n## Page Contents:\n\n";
            parsedContent.pages.forEach((page: any, index: number) => {
              content += `\n\n### [Page ${index + 1}] ${page.url}\n\n`;
              content += page.content || "No content available";
              content += "\n\n---\n\n";
            });
          }
          // If we have raw_content as a string (some older versions stored it this way)
          else if (parsedContent.raw_content) {
            content += "\n\n## Content:\n\n";
            content += parsedContent.raw_content;
          }
          // If we can't find structured content, use the whole JSON as a fallback
          else {
            content = JSON.stringify(parsedContent, null, 2);
          }
        } 
        // Last resort: just return the raw content
        else {
          content = data.content;
        }
      } catch (e) {
        console.error("Failed to parse content:", e);
        content = data.content; // Use raw content as fallback
      }

      // Create file for download
      const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
      const urlObject = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = urlObject;
      
      // Prepare filename based on URL
      const domain = new URL(url).hostname;
      a.download = `crawled-content-${domain}.txt`;
      
      // Simulate click to download file
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(urlObject);
      
      toast.success("Download started");
      
      // Log content size for debugging
      console.log(`Downloaded content size: ${content.length} characters`);
    } catch (error: any) {
      console.error("Error downloading content:", error);
      toast.error(`Failed to download content: ${error.message}`);
    } finally {
      setDownloadingId(null);
    }
  };

  return {
    downloadingId,
    handleDownloadContent
  };
};
