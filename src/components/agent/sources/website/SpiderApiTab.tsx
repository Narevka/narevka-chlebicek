
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Globe, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SpiderJob } from "./types";

interface SpiderApiTabProps {
  onWebsitesAdded: () => void;
}

const SpiderApiTab = ({ onWebsitesAdded }: SpiderApiTabProps) => {
  const { id: agentId } = useParams<{ id: string }>();
  const [spiderUrl, setSpiderUrl] = useState("");
  const [isSpiderLoading, setIsSpiderLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [jobs, setJobs] = useState<SpiderJob[]>([]);

  useEffect(() => {
    if (agentId) {
      loadSpiderJobs();
    }
  }, [agentId]);

  const loadSpiderJobs = async () => {
    try {
      // Using the correct RPC call with type assertion
      const { data, error } = await supabase.rpc('get_spider_jobs', { 
        agent_id_param: agentId 
      }) as { data: any[]; error: any };
      
      if (error) throw error;
      
      if (data) {
        // Explicitly typing the response data
        const jobData: SpiderJob[] = data.map((item: any) => ({
          id: item.id,
          url: item.url,
          status: item.status,
          created_at: item.created_at,
          updated_at: item.updated_at,
          result_count: item.result_count || 0
        }));
        
        setJobs(jobData);
      }
    } catch (error) {
      console.error("Error loading Spider jobs:", error);
      toast.error("Failed to load Spider jobs");
    }
  };

  const handleStartSpiderCrawl = async () => {
    if (!spiderUrl.trim() || !agentId) {
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
    if (!jobUrl || !agentId) {
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
        
        onWebsitesAdded();
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
      // Using the correct RPC call with type assertion
      const { error } = await supabase.rpc('delete_spider_job', { 
        job_id: id 
      }) as { data: null, error: any };
        
      if (error) throw error;
      
      setJobs(prev => prev.filter(job => job.id !== id));
      toast.success("Spider job deleted");
    } catch (error) {
      console.error("Error deleting Spider job:", error);
      toast.error("Failed to delete Spider job");
    }
  };

  return (
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
  );
};

export default SpiderApiTab;
