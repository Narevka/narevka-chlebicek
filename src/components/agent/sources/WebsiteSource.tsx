
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Globe, Download } from "lucide-react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAgentSources } from "@/hooks/useAgentSources";

const WebsiteSource = () => {
  const { id: agentId } = useParams<{ id: string }>();
  const { handleAddWebsite } = useAgentSources(agentId);
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCrawlingComplete, setIsCrawlingComplete] = useState(true);
  const [includedLinks, setIncludedLinks] = useState<{url: string, count: number, sourceId?: string}[]>([]);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  
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
      // Wywołanie handleAddWebsite z hooka useAgentSources
      const sourceId = await handleAddWebsite(url);
      
      if (!sourceId) {
        throw new Error("Nie udało się uzyskać ID źródła");
      }
      
      // Dodaj URL do listy
      const newLink = { url, count: 1, sourceId }; // Zapisujemy sourceId do późniejszego pobrania
      setIncludedLinks([...includedLinks, newLink]);
      toast.success("Strona została dodana do crawlowania");
      setUrl("");
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

  const handleDownloadContent = async (sourceId: string, url: string) => {
    if (!sourceId) {
      toast.error("Brak ID źródła do pobrania");
      return;
    }

    setDownloadingId(sourceId);
    
    try {
      const { data, error } = await supabase
        .from("agent_sources")
        .select("content")
        .eq("id", sourceId)
        .single();

      if (error) {
        throw error;
      }

      if (!data || !data.content) {
        toast.error("Nie znaleziono zawartości dla tej strony");
        return;
      }

      // Parsuj zawartość
      let content = "";
      try {
        const parsedContent = JSON.parse(data.content);
        content = parsedContent.crawled_content || "Brak zawartości";
      } catch (e) {
        content = data.content;
      }

      // Utwórz plik do pobrania
      const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
      const urlObject = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = urlObject;
      
      // Przygotuj nazwę pliku na podstawie URL
      const domain = new URL(url).hostname;
      a.download = `crawled-content-${domain}.txt`;
      
      // Symuluj kliknięcie by pobrać plik
      document.body.appendChild(a);
      a.click();
      
      // Posprzątaj
      document.body.removeChild(a);
      URL.revokeObjectURL(urlObject);
      
      toast.success("Pobieranie rozpoczęte");
    } catch (error: any) {
      console.error("Błąd podczas pobierania zawartości:", error);
      toast.error(`Nie udało się pobrać zawartości: ${error.message}`);
    } finally {
      setDownloadingId(null);
    }
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
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">{link.count} elementów</span>
                  {link.sourceId && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-blue-500 p-1 h-auto"
                      onClick={() => handleDownloadContent(link.sourceId!, link.url)}
                      disabled={downloadingId === link.sourceId}
                      title="Pobierz zawartość"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
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
