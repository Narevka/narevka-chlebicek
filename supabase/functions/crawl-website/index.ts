
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SPIDER_API_KEY = Deno.env.get('SPIDER_API_KEY');
    if (!SPIDER_API_KEY) {
      throw new Error('Missing Spider.cloud API key');
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing Supabase configuration');
    }

    // Use service role key for database operations
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    const { url, agentId, userId, limit = 5, returnFormat = "markdown" } = await req.json();
    
    if (!url || !agentId || !userId) {
      throw new Error('Required parameters: url, agentId, and userId');
    }

    console.log(`Starting crawl: ${url}, limit: ${limit}, agent: ${agentId}, user: ${userId}`);
    
    // Call Spider.cloud API for crawling
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
      console.log('Crawl data:', JSON.stringify(crawlData).substring(0, 200) + '...');
      
      // Prepare content to save in database
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
        throw new Error("Failed to retrieve page content");
      }
      
      // Save crawl result in database as agent source
      const { data: sourceData, error: sourceError } = await supabase
        .from('agent_sources')
        .insert([{
          agent_id: agentId,
          user_id: userId,
          type: 'website',
          content: JSON.stringify({
            url: url,
            crawled_content: aggregatedContent.substring(0, 100000) // Limit content length
          }),
          chars: aggregatedContent.length
        }])
        .select();
        
      if (sourceError) {
        console.error('Error saving data:', sourceError);
        throw new Error(`Error saving data: ${sourceError.message}`);
      }
      
      // Don't process with OpenAI here, just return success
      // We'll let the frontend handle the processing separately to avoid timeout issues
      if (sourceData && sourceData.length > 0) {
        const sourceId = sourceData[0].id;
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            contentCount: contentCount,
            message: `Successfully crawled ${contentCount} pages from ${url}`,
            sourceId: sourceId
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
          }
        );
      } else {
        throw new Error("Failed to save source");
      }
    } catch (spiderError) {
      console.error('Error calling Spider.cloud API:', spiderError);
      throw spiderError;
    }
  } catch (error) {
    console.error('Error executing crawl-website function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Unknown error occurred' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
