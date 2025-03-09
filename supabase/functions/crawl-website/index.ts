
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Obsługa zapytań CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SPIDER_API_KEY = Deno.env.get('SPIDER_API_KEY');
    if (!SPIDER_API_KEY) {
      throw new Error('Brak klucza API Spider.cloud');
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Brak konfiguracji Supabase');
    }

    // Używamy service role key zamiast anon key do operacji na bazie danych
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    const { url, agentId, userId, limit = 5, returnFormat = "markdown" } = await req.json();
    
    if (!url || !agentId || !userId) {
      throw new Error('Wymagane parametry: url, agentId i userId');
    }

    console.log(`Rozpoczynam crawlowanie: ${url}, limit: ${limit}, agent: ${agentId}, user: ${userId}`);
    
    // Wywołaj API Spider.cloud do crawlowania
    try {
      const crawlResponse = await fetch('https://api.spider.cloud/crawl', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SPIDER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url,
          limit: limit,
          return_format: returnFormat,
          store_data: true
        }),
      });

      if (!crawlResponse.ok) {
        const errorData = await crawlResponse.text();
        console.error('Spider.cloud API error:', errorData);
        throw new Error(`Spider.cloud API error: ${crawlResponse.status} ${errorData}`);
      }

      const crawlData = await crawlResponse.json();
      console.log('Dane z crawlowania:', JSON.stringify(crawlData).substring(0, 200) + '...');
      
      // Przygotuj treść do zapisania w bazie danych
      let aggregatedContent = '';
      let contentCount = 0;
      
      if (Array.isArray(crawlData)) {
        crawlData.forEach(item => {
          if (item.content && typeof item.content === 'string') {
            aggregatedContent += item.content + '\n\n';
            contentCount++;
          }
        });
      }
      
      if (aggregatedContent.trim().length === 0) {
        throw new Error("Nie udało się pobrać zawartości strony");
      }
      
      // Zapisz wynik crawlowania w bazie danych jako źródło agenta używając service role
      const { data: sourceData, error: sourceError } = await supabase
        .from('agent_sources')
        .insert([{
          agent_id: agentId,
          user_id: userId,
          type: 'website',
          content: JSON.stringify({
            url: url,
            crawled_content: aggregatedContent.substring(0, 100000) // Ograniczenie długości treści
          }),
          chars: aggregatedContent.length
        }])
        .select();
        
      if (sourceError) {
        console.error('Błąd podczas zapisywania danych:', sourceError);
        throw new Error(`Błąd podczas zapisywania danych: ${sourceError.message}`);
      }
      
      // Przetwórz źródło przez Open AI (podobnie jak inne typy źródeł)
      if (sourceData && sourceData.length > 0) {
        const sourceId = sourceData[0].id;
        
        try {
          const processResponse = await supabase.functions.invoke('process-agent-source', {
            body: { 
              sourceId, 
              agentId,
              operation: 'add'
            }
          });
          
          if (processResponse.error) {
            console.error("Błąd podczas przetwarzania źródła:", processResponse.error);
            throw new Error(processResponse.error.message || "Nie udało się przetworzyć źródła");
          }
        } catch (processError) {
          console.error("Błąd podczas przetwarzania źródła:", processError);
          // Nie rzucamy wyjątku, aby mimo błędu w przetwarzaniu, źródło zostało zapisane
        }
      } else {
        throw new Error("Nie udało się zapisać źródła");
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          contentCount: contentCount,
          message: `Pomyślnie crawlowano ${contentCount} stron z ${url}`,
          sourceId: sourceData && sourceData.length > 0 ? sourceData[0].id : null
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    } catch (spiderError) {
      console.error('Błąd podczas wywoływania Spider.cloud API:', spiderError);
      throw spiderError;
    }
  } catch (error) {
    console.error('Błąd podczas wykonywania funkcji crawl-website:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Wystąpił nieznany błąd' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
