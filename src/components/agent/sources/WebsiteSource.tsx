
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Globe } from "lucide-react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const WebsiteSource = () => {
  const { id: agentId } = useParams<{ id: string }>();
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCrawlingComplete, setIsCrawlingComplete] = useState(true);
  const [includedLinks, setIncludedLinks] = useState<{url: string, count: number}[]>([]);
  
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
  };
  
  const handleCrawlWebsite = async () => {
    if (!url) {
      toast.error("Proszę podać adres URL strony");
      return;
    }
    
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      toast.error("URL musi zaczynać się od http:// lub https://");
      return;
    }
    
    setIsLoading(true);
    setIsCrawlingComplete(false);
    
    try {
      // Wywołanie edge function do crawlowania strony przez Spider.cloud
      const crawlResponse = await supabase.functions.invoke('crawl-website', {
        body: { 
          url,
          agentId,
          limit: 5, // Domyślnie ograniczenie do 5 stron
          returnFormat: "markdown"
        }
      });
      
      if (crawlResponse.error) {
        throw new Error(crawlResponse.error.message || "Błąd podczas crawlowania strony");
      }
      
      if (crawlResponse.data) {
        // Dodaj URL do listy (w rzeczywistości będzie to lista URL z odpowiedzi)
        const newLink = { url, count: crawlResponse.data.contentCount || 1 };
        setIncludedLinks([...includedLinks, newLink]);
        toast.success("Strona została pomyślnie dodana do bazy wiedzy asystenta");
        setUrl("");
      }
    } catch (error: any) {
      console.error("Błąd podczas crawlowania strony:", error);
      toast.error(`Nie udało się crawlować strony: ${error.message}`);
    } finally {
      setIsLoading(false);
      setIsCrawlingComplete(true);
    }
  };
  
  const handleDeleteLink = (index: number) => {
    const newLinks = [...includedLinks];
    newLinks.splice(index, 1);
    setIncludedLinks(newLinks);
  };
  
  const handleDeleteAllLinks = () => {
    setIncludedLinks([]);
    toast.success("Wszystkie linki zostały usunięte");
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Strona internetowa</h2>
      
      <div className="mb-6">
        <h3 className="font-medium mb-2">Crawluj stronę</h3>
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
            {isLoading ? "Pobieranie..." : "Crawluj stronę"}
          </Button>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          Ta funkcja wykorzystuje Spider.cloud do crawlowania strony i dodania jej zawartości do bazy wiedzy asystenta.
        </p>

        {!isCrawlingComplete && (
          <div className="my-4 p-4 bg-blue-50 rounded-md border border-blue-200">
            <p className="text-blue-700">
              Crawlowanie trwa. To może zająć kilka minut w zależności od rozmiaru strony. Możesz opuścić tę stronę, a proces będzie kontynuowany w tle.
            </p>
          </div>
        )}
      </div>

      <div className="mt-8">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium">Dodane strony</h3>
          <Button 
            variant="ghost" 
            className="text-red-500 hover:text-red-700 hover:bg-red-50 text-sm"
            onClick={handleDeleteAllLinks}
            disabled={includedLinks.length === 0}
          >
            Usuń wszystkie
          </Button>
        </div>

        <div className="space-y-2">
          {includedLinks.length === 0 ? (
            <p className="text-gray-500 text-sm">Nie dodano jeszcze żadnych stron</p>
          ) : (
            includedLinks.map((link, index) => (
              <div key={index} className="flex items-center justify-between border rounded-md p-2">
                <div className="flex items-center gap-2">
                  <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Zaindeksowana</div>
                  <span className="truncate max-w-md">{link.url}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-gray-500">{link.count} elementów</span>
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
