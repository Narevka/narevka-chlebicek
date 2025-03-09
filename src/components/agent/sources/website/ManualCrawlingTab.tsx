
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { processSourceWithOpenAI } from "@/services/sourceProcessingService";
import { WebsiteItem } from "./types";

interface ManualCrawlingTabProps {
  onAddWebsite: (website: WebsiteItem) => void;
}

const ManualCrawlingTab = ({ onAddWebsite }: ManualCrawlingTabProps) => {
  const { id: agentId } = useParams<{ id: string }>();
  const [url, setUrl] = useState("");
  const [sitemapUrl, setSitemapUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [additionalLinks, setAdditionalLinks] = useState<string[]>([]);
  const [showLinks, setShowLinks] = useState(false);

  const handleFetchLinks = async () => {
    if (!url.trim() || !agentId) {
      toast.error("Please enter a valid URL");
      return;
    }
    
    setIsLoading(true);
    setShowLinks(false);
    
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error("Authentication required");
      }

      const response = await supabase.functions.invoke('scrape-website', {
        body: { 
          url,
          operation: 'crawl',
          agentId,
          userId: userData.user.id
        }
      });
      
      if (response.error) {
        throw new Error(response.error.message || "Failed to crawl website");
      }
      
      if (response.data && response.data.success) {
        const { links, savedSource } = response.data.result;
        
        if (savedSource) {
          const newWebsite = {
            id: savedSource.id,
            url: url,
            title: response.data.result.urlData.title || url,
            chars: response.data.result.urlData.chars,
            isProcessed: false
          };
          
          onAddWebsite(newWebsite);
          
          try {
            await processSourceWithOpenAI(savedSource.id, agentId);
            toast.success("Website added and processed successfully");
          } catch (processError) {
            console.error("Error processing website with OpenAI:", processError);
            toast.warning("Website added but failed to process with OpenAI");
          }
        }
        
        if (links && links.length > 0) {
          setAdditionalLinks(links);
          setShowLinks(true);
          toast.success(`Found ${links.length} additional links`);
        } else {
          toast.info("No additional links found on this page");
        }
      } else {
        throw new Error("Website crawling operation failed");
      }
    } catch (error: any) {
      console.error("Error crawling website:", error);
      toast.error(error.message || "Failed to crawl website");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitSitemap = async () => {
    if (!sitemapUrl.trim() || !agentId) {
      toast.error("Please enter a valid sitemap URL");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error("Authentication required");
      }

      const response = await supabase.functions.invoke('scrape-website', {
        body: { 
          sitemapUrl,
          operation: 'sitemap',
          agentId,
          userId: userData.user.id
        }
      });
      
      if (response.error) {
        throw new Error(response.error.message || "Failed to parse sitemap");
      }
      
      if (response.data && response.data.success) {
        const { urls } = response.data.result;
        
        if (urls && urls.length > 0) {
          setAdditionalLinks(urls);
          setShowLinks(true);
          toast.success(`Found ${urls.length} URLs in sitemap`);
        } else {
          toast.info("No URLs found in sitemap");
        }
      } else {
        throw new Error("Sitemap parsing operation failed");
      }
    } catch (error: any) {
      console.error("Error parsing sitemap:", error);
      toast.error(error.message || "Failed to parse sitemap");
    } finally {
      setIsLoading(false);
    }
  };

  const handleScrapeLink = async (linkUrl: string) => {
    if (!agentId) {
      toast.error("Authentication required");
      return;
    }
    
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error("Authentication required");
      }

      const response = await supabase.functions.invoke('scrape-website', {
        body: { 
          url: linkUrl,
          operation: 'scrape',
          agentId,
          userId: userData.user.id
        }
      });
      
      if (response.error) {
        throw new Error(response.error.message || "Failed to scrape link");
      }
      
      if (response.data && response.data.success) {
        const { savedSource } = response.data.result;
        
        if (savedSource) {
          const newWebsite = {
            id: savedSource.id,
            url: linkUrl,
            title: response.data.result.urlData.title || linkUrl,
            chars: response.data.result.urlData.chars,
            isProcessed: false
          };
          
          onAddWebsite(newWebsite);
          
          setAdditionalLinks(prev => prev.filter(link => link !== linkUrl));
          
          try {
            await processSourceWithOpenAI(savedSource.id, agentId);
            toast.success("Link scraped and processed successfully");
          } catch (processError: any) {
            console.error("Error processing link with OpenAI:", processError);
            toast.warning("Link scraped but failed to process with OpenAI");
          }
        }
      } else {
        throw new Error("Link scraping operation failed");
      }
    } catch (error: any) {
      console.error("Error scraping link:", error);
      toast.error(error.message || "Failed to scrape link");
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h3 className="font-medium mb-2">Crawl</h3>
        <div className="flex gap-2 mb-2">
          <Input 
            placeholder="https://www.example.com" 
            className="flex-1"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isLoading}
          />
          <Button onClick={handleFetchLinks} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Fetching...
              </>
            ) : (
              "Fetch more links"
            )}
          </Button>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          This will crawl the page and extract links from it.
        </p>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-4 text-sm text-gray-500">OR</span>
          </div>
        </div>

        <h3 className="font-medium mb-2">Submit Sitemap</h3>
        <div className="flex gap-2">
          <Input 
            placeholder="https://www.example.com/sitemap.xml" 
            className="flex-1"
            value={sitemapUrl}
            onChange={(e) => setSitemapUrl(e.target.value)}
            disabled={isLoading}
          />
          <Button onClick={handleSubmitSitemap} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              "Load sitemap"
            )}
          </Button>
        </div>
      </div>

      {showLinks && additionalLinks.length > 0 && (
        <div className="mt-6 mb-8">
          <h3 className="font-medium mb-2">Additional Links Found</h3>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Found {additionalLinks.length} links</AlertTitle>
            <AlertDescription>
              Click on any link below to scrape and add it to your agent's knowledge base.
            </AlertDescription>
          </Alert>
          <div className="mt-4 max-h-60 overflow-y-auto border rounded-md">
            {additionalLinks.map((link, index) => (
              <div key={index} className="border-b p-3 flex justify-between items-center hover:bg-gray-50">
                <span className="truncate max-w-md text-sm">{link}</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleScrapeLink(link)}
                >
                  Scrape
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManualCrawlingTab;
