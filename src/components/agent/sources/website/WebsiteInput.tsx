
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Globe, Settings, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import CrawlOptions, { CrawlOptions as CrawlOptionsType } from "./CrawlOptions";

interface WebsiteInputProps {
  onCrawlWebsite: (url: string, options: CrawlOptionsType) => Promise<void>;
  isLoading: boolean;
}

const WebsiteInput: React.FC<WebsiteInputProps> = ({ onCrawlWebsite, isLoading }) => {
  const [url, setUrl] = useState("");
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  
  // Crawl options
  const [crawlOptions, setCrawlOptions] = useState<CrawlOptionsType>({
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
    
    try {
      await onCrawlWebsite(url, crawlOptions);
      setUrl("");
    } catch (error: any) {
      console.error("Error crawling website:", error);
      toast.error(`Failed to start website crawl: ${error.message}`);
    }
  };

  // Update a specific option
  const updateCrawlOption = (key: keyof CrawlOptionsType, value: any) => {
    setCrawlOptions({
      ...crawlOptions,
      [key]: value
    });
  };

  return (
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
        <CrawlOptions 
          crawlOptions={crawlOptions}
          updateCrawlOption={updateCrawlOption}
        />
      )}

      <p className="text-sm text-blue-600 mt-2">
        Note: For crawls that take longer than 60 seconds, the process will continue in the background.
        You can check the status using the refresh button on each item.
      </p>
    </div>
  );
};

export default WebsiteInput;
