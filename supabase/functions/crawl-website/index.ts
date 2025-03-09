
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
    
    // Extract parameters from request
    const { 
      url, 
      agentId, 
      userId, 
      limit = 5, 
      returnFormat = "markdown",
      requestType = "smart", // 'http', 'headless', or 'smart'
      enableProxies = false,
      enableMetadata = true,
      enableAntiBot = false,
      enableFullResources = false,
      enableSubdomains = false,
      enableTlds = false
    } = await req.json();
    
    if (!url || !agentId || !userId) {
      throw new Error('Required parameters: url, agentId, and userId');
    }

    console.log(`Starting crawl: ${url}, limit: ${limit}, agent: ${agentId}, user: ${userId}`);
    console.log(`Advanced options: requestType=${requestType}, proxies=${enableProxies}, antiBot=${enableAntiBot}`);
    
    // Create a placeholder source record with status "crawling"
    const { data: sourceData, error: sourceInsertError } = await supabase
      .from('agent_sources')
      .insert([{
        agent_id: agentId,
        user_id: userId,
        type: 'website',
        content: JSON.stringify({
          url: url,
          status: 'crawling',
          crawl_options: {
            limit, returnFormat, requestType,
            enableProxies, enableMetadata, enableAntiBot,
            enableFullResources, enableSubdomains, enableTlds
          }
        }),
        chars: 0 // Will be updated when crawl completes
      }])
      .select();

    if (sourceInsertError) {
      console.error('Error creating placeholder source:', sourceInsertError);
      throw new Error(`Error creating placeholder source: ${sourceInsertError.message}`);
    }

    if (!sourceData || sourceData.length === 0) {
      throw new Error('Failed to create source record');
    }

    const sourceId = sourceData[0].id;

    // Start the background crawl task using modern waitUntil API
    const backgroundCrawl = async () => {
      try {
        console.log(`Background crawl started for source ${sourceId}`);
        
        // Call Spider.cloud API for crawling
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
            request: requestType,
            premium_proxies: enableProxies,
            metadata: enableMetadata,
            anti_bot: enableAntiBot,
            full_resources: enableFullResources,
            subdomains: enableSubdomains,
            tld: enableTlds,
            store_data: true
          }),
        });

        if (!crawlResponse.ok) {
          const errorData = await crawlResponse.text();
          console.error('Spider.cloud API error:', errorData);
          
          // Update the source record with the error
          await supabase
            .from('agent_sources')
            .update({
              content: JSON.stringify({
                url: url,
                status: 'error',
                error: `Spider.cloud API error: ${crawlResponse.status} ${errorData}`
              })
            })
            .eq('id', sourceId);

          return;
        }

        const crawlData = await crawlResponse.json();
        console.log('Crawl completed, processing data...');
        
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
          // Update the source record with the error
          await supabase
            .from('agent_sources')
            .update({
              content: JSON.stringify({
                url: url,
                status: 'error',
                error: "Failed to retrieve page content"
              })
            })
            .eq('id', sourceId);
          return;
        }
        
        // Update the source record with the crawled content
        const { error: updateError } = await supabase
          .from('agent_sources')
          .update({
            content: JSON.stringify({
              url: url,
              status: 'completed',
              crawled_content: aggregatedContent.substring(0, 100000), // Limit content length
              pages_crawled: contentCount
            }),
            chars: aggregatedContent.length
          })
          .eq('id', sourceId);
          
        if (updateError) {
          console.error('Error updating source with crawled content:', updateError);
        } else {
          console.log(`Successfully updated source ${sourceId} with crawled content from ${contentCount} pages`);
        }
      } catch (error) {
        console.error('Error in background crawl task:', error);
        
        // Update the source record with the error
        await supabase
          .from('agent_sources')
          .update({
            content: JSON.stringify({
              url: url,
              status: 'error',
              error: error.message || 'Unknown error occurred'
            })
          })
          .eq('id', sourceId);
      }
    };

    // Start the background task without waiting for it to complete
    // Using the EdgeRuntime waitUntil API, which is the preferred way
    // to handle background tasks in Deno Deploy edge functions
    try {
      console.log("Starting background task with EdgeRuntime.waitUntil");
      // @ts-ignore - EdgeRuntime is available in Deno Deploy
      if (typeof EdgeRuntime !== 'undefined' && EdgeRuntime.waitUntil) {
        // @ts-ignore
        EdgeRuntime.waitUntil(backgroundCrawl());
      } else {
        // Fallback for local development - just run it async
        console.log("EdgeRuntime not available, running task in background");
        backgroundCrawl().catch(e => console.error('Error in background crawl:', e));
      }
    } catch (error) {
      console.error('Error starting background task:', error);
      // Fallback to normal async execution if waitUntil fails
      backgroundCrawl().catch(e => console.error('Error in background crawl:', e));
    }
    
    // Return success immediately with the sourceId
    return new Response(
      JSON.stringify({
        success: true,
        message: `Crawl started for ${url}`,
        sourceId: sourceId,
        status: 'crawling'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
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
