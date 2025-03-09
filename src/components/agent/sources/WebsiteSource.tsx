
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Globe, Download, RotateCw } from "lucide-react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAgentSources } from "@/hooks/useAgentSources";

const WebsiteSource = () => {
  const { id: agentId } = useParams<{ id: string }>();
  const { handleAddWebsite } = useAgentSources(agentId);
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCrawlingComplete, setIsCrawlingComplete] = useState(true);
  const [includedLinks, setIncludedLinks] = useState<{url: string, count: number, sourceId?: string, isProcessing?: boolean}[]>([]);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
  };
  
  const handleCrawlWebsite = async () => {
    if (!url) {
      toast.error("Please provide a website URL");
      return;
    }
    
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      toast.error("URL must start with http:// or https://");
      return;
    }
    
    setIsLoading(true);
    setIsCrawlingComplete(false);
    
    try {
      // Call handleAddWebsite from useAgentSources hook
      const sourceId = await handleAddWebsite(url);
      
      if (!sourceId) {
        throw new Error("Failed to get source ID");
      }
      
      // Add URL to list
      const newLink = { url, count: 1, sourceId }; // Save sourceId for later download
      setIncludedLinks([...includedLinks, newLink]);
      toast.success("Website added for crawling");
      setUrl("");
    } catch (error: any) {
      console.error("Error crawling website:", error);
      toast.error(`Failed to crawl website: ${error.message}`);
    } finally {
      setIsLoading(false);
      setIsCrawlingComplete(true);
    }
  };
  
  const handleDeleteLink = (index: number) => {
    const newLinks = [...includedLinks];
    newLinks.splice(index, 1);
    setIncludedLinks(newLinks);
  };
  
  const handleDeleteAllLinks = () => {
    setIncludedLinks([]);
    toast.success("All links have been removed");
  };

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
        content = parsedContent.crawled_content || "No content";
      } catch (e) {
        content = data.content;
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
    } catch (error: any) {
      console.error("Error downloading content:", error);
      toast.error(`Failed to download content: ${error.message}`);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleProcessSource = async (sourceId: string, index: number) => {
    if (!sourceId || !agentId) {
      toast.error("Missing source ID or agent ID");
      return;
    }

    // Update state to show processing
    const newLinks = [...includedLinks];
    newLinks[index] = {...newLinks[index], isProcessing: true};
    setIncludedLinks(newLinks);
    
    try {
      // Process the source using the process-agent-source function
      const { data: processResponse, error: processError } = await supabase.functions.invoke('process-agent-source', {
        body: { 
          sourceId, 
          agentId,
          operation: 'add'
        }
      });
      
      if (processError) {
        throw new Error(processError.message || "Failed to process source");
      }
      
      toast.success("Website content processed successfully");
      
      // Update state to show processing complete
      const updatedLinks = [...includedLinks];
      updatedLinks[index] = {...updatedLinks[index], isProcessing: false};
      setIncludedLinks(updatedLinks);
    } catch (error: any) {
      console.error("Error processing source:", error);
      toast.error(`Failed to process source: ${error.message}`);
      
      // Update state to show processing failed
      const updatedLinks = [...includedLinks];
      updatedLinks[index] = {...updatedLinks[index], isProcessing: false};
      setIncludedLinks(updatedLinks);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Website</h2>
      
      <div className="mb-6">
        <h3 className="font-medium mb-2">Crawl a website</h3>
        <div className="flex gap-2 mb-2">
          <Input 
            placeholder="https://www.example.com" 
            className="flex-1"
            value={url}
            onChange={handleUrlChange}
          />
          <Button 
            onClick={handleCrawlWebsite}
            disabled={isLoading}
            className="gap-2"
          >
            <Globe className="h-4 w-4" />
            {isLoading ? "Fetching..." : "Crawl website"}
          </Button>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          This feature uses Spider.cloud to crawl the website and add its content to your assistant's knowledge base.
        </p>

        {!isCrawlingComplete && (
          <div className="my-4 p-4 bg-blue-50 rounded-md border border-blue-200">
            <p className="text-blue-700">
              Crawling in progress. This may take a few minutes depending on the website size. You can leave this page and the process will continue in the background.
            </p>
          </div>
        )}
      </div>

      <div className="mt-8">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium">Added websites</h3>
          <Button 
            variant="ghost" 
            className="text-red-500 hover:text-red-700 hover:bg-red-50 text-sm"
            onClick={handleDeleteAllLinks}
            disabled={includedLinks.length === 0}
          >
            Remove all
          </Button>
        </div>

        <div className="space-y-2">
          {includedLinks.length === 0 ? (
            <p className="text-gray-500 text-sm">No websites added yet</p>
          ) : (
            includedLinks.map((link, index) => (
              <div key={index} className="flex items-center justify-between border rounded-md p-2">
                <div className="flex items-center gap-2">
                  <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Crawled</div>
                  <span className="truncate max-w-md">{link.url}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">{link.count} items</span>
                  {link.sourceId && (
                    <>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-blue-500 p-1 h-auto"
                        onClick={() => handleProcessSource(link.sourceId!, index)}
                        disabled={link.isProcessing}
                        title="Process with OpenAI"
                      >
                        <RotateCw className={`h-4 w-4 ${link.isProcessing ? 'animate-spin' : ''}`} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-blue-500 p-1 h-auto"
                        onClick={() => handleDownloadContent(link.sourceId!, link.url)}
                        disabled={downloadingId === link.sourceId}
                        title="Download content"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-500 p-1 h-auto"
                    onClick={() => handleDeleteLink(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default WebsiteSource;
