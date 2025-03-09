
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

const WebsiteSource = () => {
  const { id: agentId } = useParams<{ id: string }>();
  const [url, setUrl] = useState("");
  const [sitemap, setSitemap] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [includedLinks, setIncludedLinks] = useState<{url: string, count: number}[]>([]);
  
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
  };
  
  const handleSitemapChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSitemap(e.target.value);
  };
  
  const handleFetchLinks = async () => {
    if (!url) {
      toast.error("Please enter a URL");
      return;
    }
    
    setIsLoading(true);
    try {
      // In a real implementation, you would fetch links from the URL
      // For now, just add the URL as a demo
      const newLink = { url, count: Math.floor(Math.random() * 1000) };
      setIncludedLinks([...includedLinks, newLink]);
      toast.success("URL added successfully");
      setUrl("");
    } catch (error) {
      toast.error("Failed to fetch links");
      console.error("Error fetching links:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleLoadSitemap = async () => {
    if (!sitemap) {
      toast.error("Please enter a sitemap URL");
      return;
    }
    
    setIsLoading(true);
    try {
      // In a real implementation, you would load the sitemap
      // For now, just add the sitemap URL as a demo
      const newLink = { url: sitemap, count: Math.floor(Math.random() * 1000) };
      setIncludedLinks([...includedLinks, newLink]);
      toast.success("Sitemap added successfully");
      setSitemap("");
    } catch (error) {
      toast.error("Failed to load sitemap");
      console.error("Error loading sitemap:", error);
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
    toast.success("All links deleted");
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
            onChange={handleUrlChange}
          />
          <Button 
            onClick={handleFetchLinks}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Fetch more links"}
          </Button>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          This will crawl all the links starting with the URL (not including files on the website).
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
            value={sitemap}
            onChange={handleSitemapChange}
          />
          <Button 
            onClick={handleLoadSitemap}
            disabled={isLoading}
          >
            Load additional sitemap
          </Button>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium">Included Links</h3>
          <Button 
            variant="ghost" 
            className="text-red-500 hover:text-red-700 hover:bg-red-50 text-sm"
            onClick={handleDeleteAllLinks}
            disabled={includedLinks.length === 0}
          >
            Delete all
          </Button>
        </div>

        <div className="space-y-2">
          {includedLinks.length === 0 ? (
            <p className="text-gray-500 text-sm">No links added yet</p>
          ) : (
            includedLinks.map((link, index) => (
              <div key={index} className="flex items-center justify-between border rounded-md p-2">
                <div className="flex items-center gap-2">
                  <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Trained</div>
                  <span className="truncate max-w-md">{link.url}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-gray-500">{link.count}</span>
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
