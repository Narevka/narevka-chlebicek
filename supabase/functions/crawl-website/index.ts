
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
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error('Brak konfiguracji Supabase');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    const { url, agentId, limit = 5, returnFormat = "markdown" } = await req.json();
    
    if (!url || !agentId) {
      throw new Error('Wymagane parametry: url i agentId');
    }

    console.log(`Rozpoczynam crawlowanie: ${url}, limit: ${limit}`);
    
    // Wywołaj API Spider.cloud do crawlowania
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
    
    // Zapisz wynik crawlowania w bazie danych jako źródło agenta
    const { data: sourceData, error: sourceError } = await supabase
      .from('agent_sources')
      .insert([{
        agent_id: agentId,
        type: 'website',
        content: JSON.stringify({
          url: url,
          crawled_content: aggregatedContent.substring(0, 100000) // Ograniczenie długości treści
        }),
        chars: aggregatedContent.length
      }])
      .select();
      
    if (sourceError) {
      throw new Error(`Błąd podczas zapisywania danych: ${sourceError.message}`);
    }
    
    // Przetwórz źródło przez Open AI (podobnie jak inne typy źródeł)
    if (sourceData && sourceData.length > 0) {
      const sourceId = sourceData[0].id;
      
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
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        contentCount: contentCount,
        message: `Pomyślnie crawlowano ${contentCount} stron z ${url}` 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
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
