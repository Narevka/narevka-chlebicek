
import React, { useState, useEffect } from "react";
import { FilesIcon, Text, Globe, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import FilesSource from "./sources/FilesSource";
import TextSource from "./sources/TextSource";
import WebsiteSource from "./sources/WebsiteSource";
import QASource from "./sources/QASource";
import SourceStats from "./sources/SourceStats";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

type SourceType = "files" | "text" | "website" | "qa";

interface SourceItem {
  id: string;
  type: string;
  content: string;
  chars: number;
  created_at: string;
}

const SourcesTab = () => {
  const { id: agentId } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [activeSource, setActiveSource] = useState<SourceType>("files");
  const [sources, setSources] = useState<SourceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRetraining, setIsRetraining] = useState(false);

  useEffect(() => {
    if (agentId) {
      fetchSources();
    }
  }, [agentId]);

  const fetchSources = async () => {
    if (!agentId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("agent_sources")
        .select("*")
        .eq("agent_id", agentId)
        .order("created_at", { ascending: false });
        
      if (error) throw error;
      
      setSources(data || []);
    } catch (error) {
      console.error("Error fetching sources:", error);
      toast.error("Failed to load sources");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddText = async (text: string) => {
    if (!agentId || !user) return;
    
    try {
      // Estimate character count
      const chars = text.length;
      
      const { data, error } = await supabase
        .from("agent_sources")
        .insert([{
          agent_id: agentId,
          user_id: user.id,
          type: "text",
          content: text,
          chars: chars
        }])
        .select();
        
      if (error) throw error;
      
      if (data) {
        setSources(prev => [...data, ...prev]);
        toast.success("Text added successfully");
      }
    } catch (error) {
      console.error("Error adding text:", error);
      toast.error("Failed to add text");
    }
  };

  const handleAddFiles = async (files: File[]) => {
    if (!agentId || !user) return;
    
    try {
      // This would normally handle file uploads to storage
      // and then process them to extract text for vectorization
      // For now, we'll mock this by treating each file as a text source
      
      for (const file of files) {
        const { data, error } = await supabase
          .from("agent_sources")
          .insert([{
            agent_id: agentId,
            user_id: user.id,
            type: "file",
            content: file.name, // In a real implementation, this would be the file path or ID
            chars: 1000 // Mock character count - would be calculated after text extraction
          }])
          .select();
          
        if (error) throw error;
        
        if (data) {
          setSources(prev => [...data, ...prev]);
        }
      }
      
      toast.success("Files added successfully");
    } catch (error) {
      console.error("Error adding files:", error);
      toast.error("Failed to add files");
    }
  };

  const handleRetrainAgent = async () => {
    if (!agentId) return;
    
    setIsRetraining(true);
    
    try {
      // In a real implementation, this would call an edge function
      // to update the OpenAI assistant with the new sources
      
      // Mock delay for demo purposes
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success("Agent retrained successfully");
    } catch (error) {
      console.error("Error retraining agent:", error);
      toast.error("Failed to retrain agent");
    } finally {
      setIsRetraining(false);
    }
  };

  // Calculate stats for display
  const filesSources = sources.filter(s => s.type === "file");
  const textSources = sources.filter(s => s.type === "text");
  const websiteSources = sources.filter(s => s.type === "website");
  const qaSources = sources.filter(s => s.type === "qa");
  
  const fileChars = filesSources.reduce((sum, item) => sum + (item.chars || 0), 0);
  const textChars = textSources.reduce((sum, item) => sum + (item.chars || 0), 0);
  const websiteChars = websiteSources.reduce((sum, item) => sum + (item.chars || 0), 0);
  const qaChars = qaSources.reduce((sum, item) => sum + (item.chars || 0), 0);
  const totalChars = fileChars + textChars + websiteChars + qaChars;

  const renderSourceContent = () => {
    switch (activeSource) {
      case "files":
        return <FilesSource onAddFiles={handleAddFiles} />;
      case "text":
        return <TextSource onAddText={handleAddText} />;
      case "website":
        return <WebsiteSource />;
      case "qa":
        return <QASource />;
      default:
        return <FilesSource onAddFiles={handleAddFiles} />;
    }
  };

  return (
    <div className="flex h-full">
      {/* Left sidebar - source types */}
      <div className="w-64 border-r bg-gray-50 h-full">
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">Sources</h2>
          <nav className="space-y-1">
            <SourceTypeButton 
              icon={<FilesIcon className="h-4 w-4" />} 
              label="Files" 
              active={activeSource === "files"}
              onClick={() => setActiveSource("files")}
            />
            <SourceTypeButton 
              icon={<Text className="h-4 w-4" />} 
              label="Text" 
              active={activeSource === "text"}
              onClick={() => setActiveSource("text")}
            />
            <SourceTypeButton 
              icon={<Globe className="h-4 w-4" />} 
              label="Website" 
              active={activeSource === "website"}
              onClick={() => setActiveSource("website")}
            />
            <SourceTypeButton 
              icon={<MessageSquare className="h-4 w-4" />} 
              label="Q&A" 
              active={activeSource === "qa"}
              onClick={() => setActiveSource("qa")}
            />
          </nav>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex">
        <div className="flex-1 p-6 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <p>Loading sources...</p>
            </div>
          ) : (
            renderSourceContent()
          )}
        </div>
        
        {/* Right stats sidebar */}
        <div className="w-80 p-6 border-l">
          <SourceStats 
            fileSources={filesSources.length}
            fileChars={fileChars}
            textSources={textSources.length}
            textChars={textChars}
            websiteSources={websiteSources.length}
            websiteChars={websiteChars}
            qaSources={qaSources.length}
            qaChars={qaChars}
            totalChars={totalChars}
            charLimit={400000}
            onRetrainClick={handleRetrainAgent}
            isRetraining={isRetraining}
          />
        </div>
      </div>
    </div>
  );
};

interface SourceTypeButtonProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

const SourceTypeButton = ({ icon, label, active, onClick }: SourceTypeButtonProps) => {
  return (
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start py-2 px-3 text-sm font-medium",
        active
          ? "bg-purple-100 text-purple-800"
          : "text-gray-700 hover:bg-gray-100"
      )}
      onClick={onClick}
    >
      <span className={cn("mr-3", active ? "text-purple-800" : "text-gray-500")}>
        {icon}
      </span>
      {label}
    </Button>
  );
};

export default SourcesTab;
