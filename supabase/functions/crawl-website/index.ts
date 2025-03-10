
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

    // Define the background crawl task
    const backgroundCrawl = async () => {
      try {
        console.log(`Background crawl started for source ${sourceId}`);
        
        // Prepare the request body for Spider.cloud API
        const spiderRequestBody = {
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
        };
        
        console.log("Spider.cloud API request:", JSON.stringify(spiderRequestBody));
        
        // Call Spider.cloud API for crawling
        const crawlResponse = await fetch('https://api.spider.cloud/crawl', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${SPIDER_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(spiderRequestBody),
        });

        // Log response status and headers
        console.log(`Spider.cloud API response status: ${crawlResponse.status}`);
        console.log(`Spider.cloud API response headers:`, Object.fromEntries(crawlResponse.headers.entries()));

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
                error: `Spider.cloud API error: ${crawlResponse.status} ${errorData}`,
                crawl_options: spiderRequestBody
              })
            })
            .eq('id', sourceId);

          return;
        }

        const crawlData = await crawlResponse.json();
        console.log('Crawl completed, processing data...');
        console.log(`Received ${crawlData?.length || 0} crawled pages (requested limit: ${limit})`);
        
        // Log first 3 pages URLs for debugging
        if (Array.isArray(crawlData) && crawlData.length > 0) {
          const sampleUrls = crawlData.slice(0, 3).map(item => item.url || 'No URL');
          console.log(`Sample URLs crawled: ${sampleUrls.join(', ')}`);
        }
        
        // Prepare content to save in database
        let aggregatedContent = '';
        let contentCount = 0;
        let totalChars = 0;
        let crawledUrls = [];
        
        if (Array.isArray(crawlData)) {
          crawlData.forEach((item, index) => {
            if (item.url) {
              crawledUrls.push(item.url);
            }
            
            if (item.content && typeof item.content === 'string') {
              // For debugging
              if (index < 3) {
                console.log(`Page ${index+1} URL: ${item.url || 'unknown'}, content length: ${item.content.length}`);
              }
              
              aggregatedContent += `# ${item.url || 'Page ' + (contentCount + 1)}\n\n`;
              aggregatedContent += item.content + '\n\n';
              contentCount++;
              totalChars += item.content.length;
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
                error: "Failed to retrieve page content",
                crawl_options: spiderRequestBody
              })
            })
            .eq('id', sourceId);
          return;
        }
        
        // Store full content (some very large content might be truncated, but using a much larger limit)
        // Using a reasonable limit to prevent DB errors
        const MAX_CONTENT_LENGTH = 1000000; // 1MB limit
        const storedContent = aggregatedContent.substring(0, MAX_CONTENT_LENGTH);
        
        if (storedContent.length < aggregatedContent.length) {
          console.log(`Content truncated from ${aggregatedContent.length} to ${storedContent.length} characters`);
        }
        
        // Create a detailed crawl report
        const crawlReport = {
          url: url,
          status: 'completed',
          requestedLimit: limit,
          pagesReceived: crawlData?.length || 0,
          pagesWithContent: contentCount,
          totalChars: totalChars,
          originalLength: aggregatedContent.length,
          storedLength: storedContent.length,
          crawledUrls: crawledUrls,
          requestConfig: spiderRequestBody,
          completedAt: new Date().toISOString()
        };
        
        console.log("Crawl report:", JSON.stringify(crawlReport));
        
        // Update the source record with the crawled content
        const { error: updateError } = await supabase
          .from('agent_sources')
          .update({
            content: JSON.stringify({
              url: url,
              status: 'completed',
              crawled_content: storedContent,
              pages_crawled: contentCount,
              total_chars: totalChars,
              original_length: aggregatedContent.length,
              stored_length: storedContent.length,
              crawl_report: crawlReport
            }),
            chars: storedContent.length
          })
          .eq('id', sourceId);
          
        if (updateError) {
          console.error('Error updating source with crawled content:', updateError);
        } else {
          console.log(`Successfully updated source ${sourceId} with crawled content from ${contentCount} pages`);
          console.log(`Content size: ${storedContent.length} characters from ${aggregatedContent.length} original chars`);
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

    // Start the background task
    console.log("Starting background crawl task");
    
    try {
      // First try to use the built-in EdgeRuntime.waitUntil method
      // @ts-ignore - Deno doesn't recognize EdgeRuntime by default
      if (typeof EdgeRuntime !== 'undefined' && typeof EdgeRuntime.waitUntil === 'function') {
        console.log("Using EdgeRuntime.waitUntil for background task");
        // @ts-ignore
        EdgeRuntime.waitUntil(backgroundCrawl());
      } else {
        // Fallback for local development or when EdgeRuntime is not available
        console.log("EdgeRuntime.waitUntil not available, running task in background without waiting");
        // Just start the task without awaiting it
        backgroundCrawl().catch(e => console.error('Error in background crawl:', e));
      }
    } catch (error) {
      console.error('Error starting background task:', error);
      // Just run it async as a fallback
      backgroundCrawl().catch(e => console.error('Error in background crawl:', e));
    }
    
    // Return success immediately with the sourceId
    return new Response(
      JSON.stringify({
        success: true,
        message: `Crawl started for ${url}`,
        sourceId: sourceId,
        status: 'crawling',
        requestedLimit: limit
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
