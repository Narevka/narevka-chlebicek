
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";

export interface CrawlOptions {
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

interface CrawlOptionsProps {
  crawlOptions: CrawlOptions;
  updateCrawlOption: (key: keyof CrawlOptions, value: any) => void;
}

const CrawlOptions: React.FC<CrawlOptionsProps> = ({ crawlOptions, updateCrawlOption }) => {
  return (
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
  );
};

export default CrawlOptions;
