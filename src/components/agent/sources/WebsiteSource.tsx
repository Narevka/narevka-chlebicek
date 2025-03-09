
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Globe, Download, RotateCw, Settings, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAgentSources } from "@/hooks/useAgentSources";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";

// Crawl options types
interface CrawlOptions {
  limit: number;
  returnFormat: string;
  requestType: string;
  enableProxies: boolean;
  enableMetadata: boolean;
  enableAntiBot: boolean;
  enableFullResources: boolean;
  enableSubdomains: boolean;
  enableTlds: boolean;
}

// Define interface for website source item with status
interface WebsiteSourceItem {
  url: string;
  count: number;
  sourceId?: string;
  isProcessing?: boolean;
  status?: 'crawling' | 'completed' | 'error';
  error?: string;
}

const WebsiteSource = () => {
  const { id: agentId } = useParams<{ id: string }>();
  const { handleAddWebsite } = useAgentSources(agentId);
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [includedLinks, setIncludedLinks] = useState<WebsiteSourceItem[]>([]);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  
  // Crawl options
  const [crawlOptions, setCrawlOptions] = useState<CrawlOptions>({
    limit: 5,
    returnFormat: "markdown",
    requestType: "smart",
    enableProxies: false,
    enableMetadata: true,
    enableAntiBot: false,
    enableFullResources: false,
    enableSubdomains: false,
    enableTlds: false
  });
  
  // Effect to periodically check the status of crawling sources
  useEffect(() => {
    const crawlingSources = includedLinks.filter(link => link.status === 'crawling');
    if (crawlingSources.length === 0) return;

    const checkCrawlStatus = async () => {
      const updatedLinks = [...includedLinks];
      let hasChanges = false;

      for (let i = 0; i < updatedLinks.length; i++) {
        const link = updatedLinks[i];
        
        if (link.status === 'crawling' && link.sourceId) {
          try {
            const { data, error } = await supabase
              .from("agent_sources")
              .select("content")
              .eq("id", link.sourceId)
              .single();

            if (error) {
              console.error("Error checking crawl status:", error);
              continue;
            }

            if (data && data.content) {
              let content;
              try {
                content = JSON.parse(data.content);
              } catch (e) {
                console.error("Error parsing content:", e);
                continue;
              }

              if (content.status && content.status !== link.status) {
                updatedLinks[i] = {
                  ...link,
                  status: content.status,
                  error: content.error,
                  count: content.pages_crawled || link.count
                };
                hasChanges = true;

                if (content.status === 'completed') {
                  toast.success(`Crawl completed for ${link.url}`);
                } else if (content.status === 'error') {
                  toast.error(`Crawl failed for ${link.url}: ${content.error}`);
                }
              }
            }
          } catch (error) {
            console.error("Error checking source status:", error);
          }
        }
      }

      if (hasChanges) {
        setIncludedLinks(updatedLinks);
      }
    };

    const intervalId = setInterval(checkCrawlStatus, 5000); // Check every 5 seconds
    return () => clearInterval(intervalId);
  }, [includedLinks]);

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
    
    try {
      // Call handleAddWebsite from useAgentSources hook with advanced options
      const sourceId = await handleAddWebsite(url, crawlOptions);
      
      if (!sourceId) {
        throw new Error("Failed to get source ID");
      }
      
      // Add URL to list
      const newLink: WebsiteSourceItem = { 
        url, 
        count: 0, 
        sourceId,
        status: 'crawling'
      };
      
      setIncludedLinks([...includedLinks, newLink]);
      toast.success("Website crawl started");
      setUrl("");
    } catch (error: any) {
      console.error("Error crawling website:", error);
      toast.error(`Failed to start website crawl: ${error.message}`);
    } finally {
      setIsLoading(false);
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

  // Check crawl status manually
  const handleCheckStatus = async (sourceId: string, index: number) => {
    if (!sourceId) return;
    
    try {
      const { data, error } = await supabase
        .from("agent_sources")
        .select("content")
        .eq("id", sourceId)
        .single();

      if (error) throw error;
      
      if (data && data.content) {
        let content;
        try {
          content = JSON.parse(data.content);
        } catch (e) {
          toast.error("Could not parse source content");
          return;
        }
        
        // Update the link with current status
        const newLinks = [...includedLinks];
        newLinks[index] = {
          ...newLinks[index],
          status: content.status || newLinks[index].status,
          error: content.error,
          count: content.pages_crawled || newLinks[index].count
        };
        
        setIncludedLinks(newLinks);
        
        if (content.status === 'completed') {
          toast.success("Crawl has completed");
        } else if (content.status === 'error') {
          toast.error(`Crawl error: ${content.error}`);
        } else if (content.status === 'crawling') {
          toast.info("Crawl is still in progress");
        }
      }
    } catch (error: any) {
      console.error("Error checking status:", error);
      toast.error(`Failed to check status: ${error.message}`);
    }
  };

  // Update a specific option
  const updateCrawlOption = (key: keyof CrawlOptions, value: any) => {
    setCrawlOptions({
      ...crawlOptions,
      [key]: value
    });
  };

  // Function to get badge for current status
  const getStatusBadge = (status?: string) => {
    if (!status || status === 'crawling') {
      return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Crawling</Badge>;
    } else if (status === 'completed') {
      return <Badge variant="outline" className="bg-green-100 text-green-800">Completed</Badge>;
    } else if (status === 'error') {
      return <Badge variant="outline" className="bg-red-100 text-red-800">Error</Badge>;
    }
    return null;
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
            {isLoading ? "Starting..." : "Crawl website"}
          </Button>
        </div>
        <p className="text-sm text-gray-500 mb-2">
          This feature uses Spider.cloud to crawl the website and add its content to your assistant's knowledge base.
        </p>

        {/* Advanced options toggler */}
        <Button
          variant="outline" 
          size="sm"
          onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
          className="mb-2 gap-1"
        >
          <Settings className="h-3.5 w-3.5" />
          Advanced Options
          {showAdvancedOptions ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </Button>

        {/* Advanced options panel */}
        {showAdvancedOptions && (
          <div className="p-4 border rounded-md mb-4 bg-gray-50 dark:bg-gray-900 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Request Type */}
              <div>
                <label className="block text-sm font-medium mb-1">Request Type</label>
                <Select 
                  value={crawlOptions.requestType} 
                  onValueChange={(v) => updateCrawlOption('requestType', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Request Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="http">HTTP</SelectItem>
                    <SelectItem value="headless">Headless</SelectItem>
                    <SelectItem value="smart">Smart</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">Smart uses HTTP first and Chrome headless when needed</p>
              </div>

              {/* Return Format */}
              <div>
                <label className="block text-sm font-medium mb-1">Return Format</label>
                <Select 
                  value={crawlOptions.returnFormat} 
                  onValueChange={(v) => updateCrawlOption('returnFormat', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Return Format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="markdown">Markdown</SelectItem>
                    <SelectItem value="commonmark">CommonMark</SelectItem>
                    <SelectItem value="raw">Raw (HTML)</SelectItem>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="bytes">Bytes</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">How content should be formatted</p>
              </div>

              {/* Crawl Limit */}
              <div>
                <label className="block text-sm font-medium mb-1">Page Limit: {crawlOptions.limit}</label>
                <Slider 
                  value={[crawlOptions.limit]} 
                  min={1} 
                  max={300} 
                  step={1} 
                  onValueChange={(value) => updateCrawlOption('limit', value[0])}
                  className="mb-1"
                />
                <p className="text-xs text-gray-500">Maximum number of pages to crawl (1-300)</p>
              </div>

              {/* Toggle options */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Premium Proxies</label>
                    <p className="text-xs text-gray-500">Use premium proxies to avoid detection</p>
                  </div>
                  <Switch 
                    checked={crawlOptions.enableProxies} 
                    onCheckedChange={(checked) => updateCrawlOption('enableProxies', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Anti-Bot Mode</label>
                    <p className="text-xs text-gray-500">Techniques to avoid being blocked</p>
                  </div>
                  <Switch 
                    checked={crawlOptions.enableAntiBot} 
                    onCheckedChange={(checked) => updateCrawlOption('enableAntiBot', checked)}
                  />
                </div>
              </div>
              
              {/* More toggle options */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Metadata</label>
                    <p className="text-xs text-gray-500">Store metadata like title, description</p>
                  </div>
                  <Switch 
                    checked={crawlOptions.enableMetadata} 
                    onCheckedChange={(checked) => updateCrawlOption('enableMetadata', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Full Resources</label>
                    <p className="text-xs text-gray-500">Scrape all resources (CSS, JS, images)</p>
                  </div>
                  <Switch 
                    checked={crawlOptions.enableFullResources} 
                    onCheckedChange={(checked) => updateCrawlOption('enableFullResources', checked)}
                  />
                </div>
              </div>
              
              {/* Even more toggle options */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Subdomains</label>
                    <p className="text-xs text-gray-500">Crawl subdomains of the site</p>
                  </div>
                  <Switch 
                    checked={crawlOptions.enableSubdomains} 
                    onCheckedChange={(checked) => updateCrawlOption('enableSubdomains', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">TLD Variants</label>
                    <p className="text-xs text-gray-500">Crawl other TLD variants of site</p>
                  </div>
                  <Switch 
                    checked={crawlOptions.enableTlds} 
                    onCheckedChange={(checked) => updateCrawlOption('enableTlds', checked)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <p className="text-sm text-blue-600 mt-2">
          Note: For crawls that take longer than 60 seconds, the process will continue in the background.
          You can check the status using the refresh button on each item.
        </p>
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
                  {getStatusBadge(link.status)}
                  <span className="truncate max-w-md">{link.url}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">{link.count} pages</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-blue-500 p-1 h-auto"
                    onClick={() => handleCheckStatus(link.sourceId!, index)}
                    disabled={!link.sourceId}
                    title="Check status"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  {link.sourceId && link.status === 'completed' && (
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
