
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useParams } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { processSourceWithOpenAI } from "@/services/sourceProcessingService";

interface WebsiteItem {
  id: string;
  url: string;
  title: string;
  chars: number;
  isProcessed?: boolean;
}

const WebsiteSource = () => {
  const { user } = useAuth();
  const { id: agentId } = useParams<{ id: string }>();
  const [url, setUrl] = useState("");
  const [sitemapUrl, setSitemapUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [websites, setWebsites] = useState<WebsiteItem[]>([]);
  const [additionalLinks, setAdditionalLinks] = useState<string[]>([]);
  const [showLinks, setShowLinks] = useState(false);

  // Load existing website sources on component mount
  React.useEffect(() => {
    if (agentId) {
      loadWebsiteSources();
    }
  }, [agentId]);

  const loadWebsiteSources = async () => {
    try {
      const { data, error } = await supabase
        .from("agent_sources")
        .select("*")
        .eq("agent_id", agentId)
        .eq("type", "website")
        .order("created_at", { ascending: false });
        
      if (error) throw error;
      
      const websiteItems: WebsiteItem[] = data.map(item => {
        try {
          const content = JSON.parse(item.content);
          return {
            id: item.id,
            url: content.url,
            title: content.title || content.url,
            chars: item.chars,
            isProcessed: true
          };
        } catch (e) {
          return {
            id: item.id,
            url: item.content,
            title: item.content,
            chars: item.chars,
            isProcessed: true
          };
        }
      });
      
      setWebsites(websiteItems);
    } catch (error) {
      console.error("Error loading website sources:", error);
      toast.error("Failed to load website sources");
    }
  };

  const handleFetchLinks = async () => {
    if (!url.trim() || !user?.id || !agentId) {
      toast.error("Please enter a valid URL");
      return;
    }
    
    setIsLoading(true);
    setShowLinks(false);
    
    try {
      const response = await supabase.functions.invoke('scrape-website', {
        body: { 
          url,
          operation: 'crawl',
          agentId,
          userId: user.id
        }
      });
      
      if (response.error) {
        throw new Error(response.error.message || "Failed to crawl website");
      }
      
      if (response.data && response.data.success) {
        const { links, savedSource } = response.data.result;
        
        // Update the list of websites
        if (savedSource) {
          const newWebsite = {
            id: savedSource.id,
            url: url,
            title: response.data.result.urlData.title || url,
            chars: response.data.result.urlData.chars,
            isProcessed: false
          };
          
          setWebsites(prev => [newWebsite, ...prev]);
          
          // Process the source with OpenAI
          try {
            await processSourceWithOpenAI(savedSource.id, agentId);
            // Update the processed status
            setWebsites(prev => prev.map(w => 
              w.id === savedSource.id ? {...w, isProcessed: true} : w
            ));
            toast.success("Website added and processed successfully");
          } catch (processError) {
            console.error("Error processing website with OpenAI:", processError);
            toast.warning("Website added but failed to process with OpenAI");
          }
        }
        
        // Show additional links
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

  const handleScrapeLink = async (linkUrl: string) => {
    if (!user?.id || !agentId) {
      toast.error("Authentication required");
      return;
    }
    
    try {
      const response = await supabase.functions.invoke('scrape-website', {
        body: { 
          url: linkUrl,
          operation: 'scrape',
          agentId,
          userId: user.id
        }
      });
      
      if (response.error) {
        throw new Error(response.error.message || "Failed to scrape link");
      }
      
      if (response.data && response.data.success) {
        const { savedSource } = response.data.result;
        
        // Update the list of websites
        if (savedSource) {
          const newWebsite = {
            id: savedSource.id,
            url: linkUrl,
            title: response.data.result.urlData.title || linkUrl,
            chars: response.data.result.urlData.chars,
            isProcessed: false
          };
          
          setWebsites(prev => [newWebsite, ...prev]);
          
          // Remove the link from the additional links
          setAdditionalLinks(prev => prev.filter(link => link !== linkUrl));
          
          // Process the source with OpenAI
          try {
            await processSourceWithOpenAI(savedSource.id, agentId);
            // Update the processed status
            setWebsites(prev => prev.map(w => 
              w.id === savedSource.id ? {...w, isProcessed: true} : w
            ));
            toast.success("Link scraped and processed successfully");
          } catch (processError) {
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

  const handleSubmitSitemap = async () => {
    if (!sitemapUrl.trim() || !user?.id || !agentId) {
      toast.error("Please enter a valid sitemap URL");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await supabase.functions.invoke('scrape-website', {
        body: { 
          sitemapUrl,
          operation: 'sitemap',
          agentId,
          userId: user.id
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

  const handleDeleteWebsite = async (id: string) => {
    try {
      const { error } = await supabase
        .from("agent_sources")
        .delete()
        .eq("id", id);
        
      if (error) throw error;
      
      setWebsites(prev => prev.filter(w => w.id !== id));
      toast.success("Website source deleted");
    } catch (error) {
      console.error("Error deleting website source:", error);
      toast.error("Failed to delete website source");
    }
  };

  const handleDeleteAllWebsites = async () => {
    if (!agentId) return;
    
    try {
      const { error } = await supabase
        .from("agent_sources")
        .delete()
        .eq("agent_id", agentId)
        .eq("type", "website");
        
      if (error) throw error;
      
      setWebsites([]);
      toast.success("All website sources deleted");
    } catch (error) {
      console.error("Error deleting all website sources:", error);
      toast.error("Failed to delete all website sources");
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Website</h2>
      
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

      <div className="mt-8">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium">Included Links</h3>
          {websites.length > 0 && (
            <Button 
              variant="ghost" 
              className="text-red-500 hover:text-red-700 hover:bg-red-50 text-sm"
              onClick={handleDeleteAllWebsites}
            >
              Delete all
            </Button>
          )}
        </div>

        {websites.length === 0 ? (
          <p className="text-gray-500 text-sm">No websites added yet.</p>
        ) : (
          <div className="space-y-2">
            {websites.map((website) => (
              <div 
                key={website.id} 
                className="flex items-center justify-between border rounded-md p-2"
              >
                <div className="flex items-center gap-2">
                  <div className={`${website.isProcessed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'} text-xs px-2 py-1 rounded-full`}>
                    {website.isProcessed ? 'Trained' : 'Processing'}
                  </div>
                  <div className="flex flex-col">
                    <span className="truncate max-w-md font-medium">{website.title}</span>
                    <span className="truncate max-w-md text-xs text-gray-500">{website.url}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-gray-500">{website.chars}</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-500 p-1 h-auto"
                    onClick={() => handleDeleteWebsite(website.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WebsiteSource;
