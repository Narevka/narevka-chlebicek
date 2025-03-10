
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

    // Create detailed logs for frontend display
    const detailedRequestLog = {
      timestamp: new Date().toISOString(),
      event: "crawl_requested",
      url: url,
      agent_id: agentId,
      user_id: userId,
      parameters: {
        limit,
        returnFormat,
        requestType,
        enableProxies,
        enableMetadata,
        enableAntiBot,
        enableFullResources,
        enableSubdomains,
        enableTlds
      }
    };
    
    console.log(`Starting crawl with configuration:`, JSON.stringify(detailedRequestLog, null, 2));
    
    // Create a placeholder source record with status "crawling" and initial logs
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
          },
          logs: [{
            timestamp: new Date().toISOString(),
            level: "info",
            message: `Crawl initiated for ${url}`,
            details: detailedRequestLog
          }]
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
        
        // Add log entry for crawl start
        await updateSourceWithLog(supabase, sourceId, "info", `Background crawl process started for ${url}`);
        
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
        
        // Log the Spider.cloud API request configuration
        await updateSourceWithLog(
          supabase, 
          sourceId, 
          "info", 
          `Sending request to Spider.cloud API`, 
          {
            request_body: spiderRequestBody,
            api_endpoint: "https://api.spider.cloud/crawl"
          }
        );
        
        console.log("Spider.cloud API request:", JSON.stringify(spiderRequestBody));
        
        // Start timing the API call
        const apiCallStartTime = Date.now();
        
        // Call Spider.cloud API for crawling
        const crawlResponse = await fetch('https://api.spider.cloud/crawl', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${SPIDER_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(spiderRequestBody),
        });

        const apiCallDuration = Date.now() - apiCallStartTime;
        
        // Log response status and headers
        console.log(`Spider.cloud API response status: ${crawlResponse.status} (took ${apiCallDuration}ms)`);
        console.log(`Spider.cloud API response headers:`, Object.fromEntries(crawlResponse.headers.entries()));
        
        // Log the API response details
        await updateSourceWithLog(
          supabase, 
          sourceId, 
          crawlResponse.ok ? "info" : "error", 
          `Received response from Spider.cloud API (${crawlResponse.status})`, 
          {
            status: crawlResponse.status,
            statusText: crawlResponse.statusText,
            headers: Object.fromEntries(crawlResponse.headers.entries()),
            duration_ms: apiCallDuration
          }
        );

        if (!crawlResponse.ok) {
          const errorData = await crawlResponse.text();
          console.error('Spider.cloud API error:', errorData);
          
          await updateSourceWithLog(
            supabase, 
            sourceId, 
            "error", 
            `Spider.cloud API returned error: ${crawlResponse.status} ${crawlResponse.statusText}`, 
            {
              error_details: errorData
            }
          );
          
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
        await updateSourceWithLog(
          supabase, 
          sourceId, 
          "info", 
          `Crawl completed successfully. Processing data...`, 
          {
            pages_received: crawlData?.length || 0,
            requested_limit: limit
          }
        );
        
        console.log('Crawl completed, processing data...');
        console.log(`Received ${crawlData?.length || 0} crawled pages (requested limit: ${limit})`);
        
        // Log first 3 pages URLs for debugging
        if (Array.isArray(crawlData) && crawlData.length > 0) {
          const sampleUrls = crawlData.slice(0, 3).map(item => item.url || 'No URL');
          console.log(`Sample URLs crawled: ${sampleUrls.join(', ')}`);
          
          await updateSourceWithLog(
            supabase, 
            sourceId, 
            "info", 
            `Sample URLs crawled (first 3 of ${crawlData.length})`, 
            {
              sample_urls: sampleUrls
            }
          );
        }
        
        // Prepare content to save in database
        let aggregatedContent = '';
        let contentCount = 0;
        let totalChars = 0;
        let crawledUrls = [];
        let pageSizes = [];
        
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
              
              pageSizes.push({
                url: item.url || `Page ${index+1}`,
                chars: item.content.length,
                size_kb: Math.round(item.content.length / 1024)
              });
            }
          });
          
          // Log information about processed pages
          await updateSourceWithLog(
            supabase, 
            sourceId, 
            "info", 
            `Content processing complete`, 
            {
              pages_with_content: contentCount,
              total_chars: totalChars,
              total_size_kb: Math.round(totalChars / 1024),
              page_size_distribution: pageSizes.slice(0, 10)  // Show first 10 pages' sizes
            }
          );
        }
        
        if (aggregatedContent.trim().length === 0) {
          await updateSourceWithLog(
            supabase, 
            sourceId, 
            "error", 
            `Failed to retrieve any page content`
          );
          
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
          
          await updateSourceWithLog(
            supabase, 
            sourceId, 
            "warning", 
            `Content truncated due to size limitations`, 
            {
              original_length: aggregatedContent.length,
              truncated_length: storedContent.length,
              truncated_percentage: Math.round((1 - storedContent.length / aggregatedContent.length) * 100)
            }
          );
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
          completedAt: new Date().toISOString(),
          pageSizes: pageSizes.slice(0, 10),  // First 10 pages for reference
          processingStats: {
            avgCharsPerPage: contentCount > 0 ? Math.round(totalChars / contentCount) : 0,
            largestPage: pageSizes.length > 0 ? Math.max(...pageSizes.map(p => p.chars)) : 0,
            smallestPage: pageSizes.length > 0 ? Math.min(...pageSizes.map(p => p.chars)) : 0
          }
        };
        
        console.log("Crawl report:", JSON.stringify(crawlReport));
        
        await updateSourceWithLog(
          supabase, 
          sourceId, 
          "info", 
          `Crawl completed successfully`, 
          {
            crawl_report: crawlReport
          }
        );
        
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
          await updateSourceWithLog(
            supabase, 
            sourceId, 
            "error", 
            `Error updating source with crawled content: ${updateError.message}`
          );
        } else {
          console.log(`Successfully updated source ${sourceId} with crawled content from ${contentCount} pages`);
          console.log(`Content size: ${storedContent.length} characters from ${aggregatedContent.length} original chars`);
          
          await updateSourceWithLog(
            supabase, 
            sourceId, 
            "info", 
            `Source updated successfully with crawled content`, 
            {
              pages: contentCount,
              chars: storedContent.length
            }
          );
        }
      } catch (error) {
        console.error('Error in background crawl task:', error);
        
        await updateSourceWithLog(
          supabase, 
          sourceId, 
          "error", 
          `Error in background crawl task: ${error.message}`
        );
        
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

    // Helper function to add logs to the source
    async function updateSourceWithLog(supabase, sourceId, level, message, details = null) {
      try {
        // First get current content to append to logs
        const { data, error } = await supabase
          .from('agent_sources')
          .select('content')
          .eq('id', sourceId)
          .single();
          
        if (error) {
          console.error('Error fetching source for log update:', error);
          return;
        }
        
        let content;
        try {
          content = JSON.parse(data.content);
        } catch (e) {
          console.error('Error parsing content for log update:', e);
          content = { logs: [] };
        }
        
        // Ensure logs array exists
        if (!content.logs) {
          content.logs = [];
        }
        
        // Add new log entry
        content.logs.push({
          timestamp: new Date().toISOString(),
          level,
          message,
          details
        });
        
        // Update source with new logs
        await supabase
          .from('agent_sources')
          .update({
            content: JSON.stringify(content)
          })
          .eq('id', sourceId);
          
        console.log(`Log added to source ${sourceId}: [${level}] ${message}`);
      } catch (logError) {
        console.error('Error adding log to source:', logError);
      }
    }

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
