import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { processSourceWithOpenAI } from "@/services/sourceProcessingService";
import ManualCrawlingTab from "./website/ManualCrawlingTab";
import SpiderApiTab from "./website/SpiderApiTab";
import WebsiteList from "./website/WebsiteList";
import { WebsiteItem } from "./website/types";

const WebsiteSource = () => {
  const { id: agentId } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("manual");
  const [websites, setWebsites] = useState<WebsiteItem[]>([]);

  useEffect(() => {
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

  const handleAddWebsite = (website: WebsiteItem) => {
    setWebsites(prev => {
      const exists = prev.some(w => w.id === website.id);
      if (exists) {
        return prev.map(w => 
          w.id === website.id ? {...website, isProcessed: true} : w
        );
      }
      return [website, ...prev];
    });
  };

  const handleWebsiteProcessed = async (websiteId: string) => {
    setWebsites(prev => prev.map(w => 
      w.id === websiteId ? {...w, isProcessed: true} : w
    ));
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
          <ManualCrawlingTab onAddWebsite={handleAddWebsite} />
        </TabsContent>
        
        <TabsContent value="spider">
          <SpiderApiTab onWebsitesAdded={loadWebsiteSources} />
        </TabsContent>
      </Tabs>

      <WebsiteList 
        websites={websites} 
        onWebsitesChanged={loadWebsiteSources} 
      />
    </div>
  );
};

export default WebsiteSource;
