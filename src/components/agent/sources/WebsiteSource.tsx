import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, AlertCircle, Loader2, Globe } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useParams } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { processSourceWithOpenAI } from "@/services/sourceProcessingService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface WebsiteItem {
  id: string;
  url: string;
  title: string;
  chars: number;
  isProcessed?: boolean;
}

interface SpiderJob {
  id: string;
  url: string;
  status: string;
  created_at: string;
  updated_at: string;
  result_count: number;
}

const WebsiteSource = () => {
  const { user } = useAuth();
  const { id: agentId } = useParams<{ id: string }>();
  const [url, setUrl] = useState("");
  const [sitemapUrl, setSitemapUrl] = useState("");
  const [spiderUrl, setSpiderUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSpiderLoading, setIsSpiderLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [websites, setWebsites] = useState<WebsiteItem[]>([]);
  const [additionalLinks, setAdditionalLinks] = useState<string[]>([]);
  const [showLinks, setShowLinks] = useState(false);
  const [jobs, setJobs] = useState<SpiderJob[]>([]);
  const [activeTab, setActiveTab] = useState("manual");

  useEffect(() => {
    if (agentId) {
      loadWebsiteSources();
      loadSpiderJobs();
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

  const loadSpiderJobs = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_spider_jobs', { agent_id_param: agentId })
        .select()
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      const jobData: SpiderJob[] = (data || []).map(item => ({
        id: item.id,
        url: item.url,
        status: item.status,
        created_at: item.created_at,
        updated_at: item.updated_at,
        result_count: item.result_count || 0
      }));
      
      setJobs(jobData);
    } catch (error) {
      console.error("Error loading Spider jobs:", error);
      toast.error("Failed to load Spider jobs");
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
        
        if (savedSource) {
          const newWebsite = {
            id: savedSource.id,
            url: url,
            title: response.data.result.urlData.title || url,
            chars: response.data.result.urlData.chars,
            isProcessed: false
          };
          
          setWebsites(prev => [newWebsite, ...prev]);
          
          try {
            await processSourceWithOpenAI(savedSource.id, agentId);
            setWebsites(prev => prev.map(w => 
              w.id === savedSource.id ? {...w, isProcessed: true} : w
            ));
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
        
        if (savedSource) {
          const newWebsite = {
            id: savedSource.id,
            url: linkUrl,
            title: response.data.result.urlData.title || linkUrl,
            chars: response.data.result.urlData.chars,
            isProcessed: false
          };
          
          setWebsites(prev => [newWebsite, ...prev]);
          
          setAdditionalLinks(prev => prev.filter(link => link !== linkUrl));
          
          try {
            await processSourceWithOpenAI(savedSource.id, agentId);
            setWebsites(prev => prev.map(w => 
              w.id === savedSource.id ? {...w, isProcessed: true} : w
            ));
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

  const handleStartSpiderCrawl = async () => {
    if (!spiderUrl.trim() || !user?.id || !agentId) {
      toast.error("Please enter a valid URL");
      return;
    }
    
    setIsSpiderLoading(true);
    
    try {
      const response = await supabase.functions.invoke('spider-trigger', {
        body: { 
          url: spiderUrl,
          agentId,
          options: { limit: 100 }
        }
      });
      
      if (response.error) {
        throw new Error(response.error.message || "Failed to start Spider crawl");
      }
      
      if (response.data && response.data.success) {
        toast.success("Spider crawler started successfully");
        setSpiderUrl("");
        
        await loadSpiderJobs();
      } else {
        throw new Error("Spider crawler operation failed");
      }
    } catch (error: any) {
      console.error("Error starting Spider crawl:", error);
      toast.error(error.message || "Failed to start Spider crawl");
    } finally {
      setIsSpiderLoading(false);
    }
  };

  const handleFetchSpiderData = async (jobUrl: string) => {
    if (!jobUrl || !user?.id || !agentId) {
      toast.error("URL and authentication required");
      return;
    }
    
    setIsFetching(true);
    
    try {
      const response = await supabase.functions.invoke('spider-fetch', {
        body: { 
          url: jobUrl,
          agentId
        }
      });
      
      if (response.error) {
        throw new Error(response.error.message || "Failed to fetch Spider data");
      }
      
      if (response.data && response.data.success) {
        toast.success(`Imported ${response.data.count} pages from Spider API`);
        
        await loadWebsiteSources();
        await loadSpiderJobs();
      } else {
        throw new Error("Spider data fetching operation failed");
      }
    } catch (error: any) {
      console.error("Error fetching Spider data:", error);
      toast.error(error.message || "Failed to fetch Spider data");
    } finally {
      setIsFetching(false);
    }
  };

  const handleDeleteJob = async (id: string) => {
    try {
      const { error } = await supabase
        .rpc('delete_spider_job', { job_id: id });
        
      if (error) throw error;
      
      setJobs(prev => prev.filter(job => job.id !== id));
      toast.success("Spider job deleted");
    } catch (error) {
      console.error("Error deleting Spider job:", error);
      toast.error("Failed to delete Spider job");
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
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="manual">Manual Crawling</TabsTrigger>
          <TabsTrigger value="spider">Spider API</TabsTrigger>
        </TabsList>
        
        <TabsContent value="manual">
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
        </TabsContent>
        
        <TabsContent value="spider">
          <div className="mb-6">
            <Alert className="mb-4">
              <Globe className="h-4 w-4" />
              <AlertTitle>Spider API</AlertTitle>
              <AlertDescription>
                Spider API is more powerful for large websites and can handle anti-bot measures. 
                Enter the URL below and click "Start Spider" to begin the crawling process.
              </AlertDescription>
            </Alert>
            
            <div className="flex gap-2 mb-2">
              <Input 
                placeholder="Enter website URL (e.g., example.com)" 
                className="flex-1"
                value={spiderUrl}
                onChange={(e) => setSpiderUrl(e.target.value)}
                disabled={isSpiderLoading}
              />
              <Button 
                onClick={handleStartSpiderCrawl} 
                disabled={isSpiderLoading}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isSpiderLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <Globe className="h-4 w-4 mr-2" />
                    Start Spider
                  </>
                )}
              </Button>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              Spider API will crawl the website and store the data. The process might take a few minutes 
              for larger websites. After completion, you can fetch the data using the "Import Data" button.
            </p>
            
            <h3 className="font-medium mb-2">Spider Crawl Jobs</h3>
            {jobs.length === 0 ? (
              <p className="text-sm text-gray-500">No Spider jobs yet. Start one above.</p>
            ) : (
              <div className="space-y-2">
                {jobs.map((job) => (
                  <div 
                    key={job.id} 
                    className="flex items-center justify-between border rounded-md p-3"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`
                        ${job.status === 'completed' ? 'bg-green-100 text-green-800' : 
                          job.status === 'imported' ? 'bg-blue-100 text-blue-800' : 
                          job.status === 'processing' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-gray-100 text-gray-800'} 
                        text-xs px-2 py-1 rounded-full`}
                      >
                        {job.status}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium">{job.url}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(job.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {job.status === 'completed' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="text-blue-500 border-blue-500"
                          onClick={() => handleFetchSpiderData(job.url)}
                          disabled={isFetching}
                        >
                          {isFetching ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Import Data"
                          )}
                        </Button>
                      )}
                      {job.status === 'imported' && (
                        <span className="text-sm text-gray-500">
                          Imported {job.result_count} pages
                        </span>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-500 p-1 h-auto"
                        onClick={() => handleDeleteJob(job.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

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
