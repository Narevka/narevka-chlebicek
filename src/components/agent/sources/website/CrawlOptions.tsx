
import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export interface CrawlOptions {
  limit?: number;
  returnFormat?: string;
  requestType?: string;
  enableProxies?: boolean;
  enableMetadata?: boolean;
  enableAntiBot?: boolean;
  enableFullResources?: boolean;
  enableSubdomains?: boolean;
  enableTlds?: boolean;
}

interface CrawlOptionsProps {
  crawlOptions: CrawlOptions;
  updateCrawlOption: (key: keyof CrawlOptions, value: any) => void;
}

const CrawlOptions: React.FC<CrawlOptionsProps> = ({ 
  crawlOptions, 
  updateCrawlOption 
}) => {
  const handleLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue > 0) {
      updateCrawlOption('limit', numValue);
    }
  };

  const handleFormatChange = (value: string) => {
    updateCrawlOption('returnFormat', value);
  };

  return (
    <Card className="p-4 mb-4 bg-gray-50">
      <h4 className="font-medium mb-2">Crawl Options (Firecrawl)</h4>
      <Separator className="mb-4" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Page Limit */}
        <div className="space-y-2">
          <Label htmlFor="pageLimit">Page Limit</Label>
          <Input
            id="pageLimit"
            type="number"
            min="1"
            max="500"
            value={crawlOptions.limit || 5}
            onChange={handleLimitChange}
          />
          <p className="text-xs text-gray-500">Maximum number of pages to crawl (1-500)</p>
        </div>

        {/* Return Format */}
        <div className="space-y-2">
          <Label htmlFor="returnFormat">Content Format</Label>
          <Select
            value={crawlOptions.returnFormat || "markdown"}
            onValueChange={handleFormatChange}
          >
            <SelectTrigger id="returnFormat">
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="markdown">Markdown</SelectItem>
              <SelectItem value="html">HTML</SelectItem>
              <SelectItem value="text">Plain Text</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500">Format for the crawled content</p>
        </div>
      </div>

      <Separator className="my-4" />
      
      <h5 className="font-medium mb-2">Advanced Options</h5>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Removed metadata option as it's not supported by Firecrawl API */}

        {/* Subdomain Option */}
        <div className="flex items-center space-x-2">
          <Switch
            id="enableSubdomains"
            checked={crawlOptions.enableSubdomains === true}
            onCheckedChange={(checked) => updateCrawlOption('enableSubdomains', checked)}
          />
          <Label htmlFor="enableSubdomains" className="cursor-pointer">
            Include Subdomains
          </Label>
          <p className="text-xs text-gray-500 ml-auto">Crawl subdomains of the main site</p>
        </div>

        {/* TLDs/Backward Links Option */}
        <div className="flex items-center space-x-2">
          <Switch
            id="enableTlds"
            checked={crawlOptions.enableTlds === true}
            onCheckedChange={(checked) => updateCrawlOption('enableTlds', checked)}
          />
          <Label htmlFor="enableTlds" className="cursor-pointer">
            Allow Backward Links
          </Label>
          <p className="text-xs text-gray-500 ml-auto">Follow links outside direct path</p>
        </div>
      </div>

      <p className="mt-4 text-xs text-blue-600">
        Note: Advanced options are powered by Firecrawl for high-quality web crawling.
      </p>
    </Card>
  );
};

export default CrawlOptions;
