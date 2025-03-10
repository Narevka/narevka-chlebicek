
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
    const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');
    if (!FIRECRAWL_API_KEY) {
      throw new Error('Missing Firecrawl API key');
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
      requestType = "smart", // Not directly used in Firecrawl but kept for compatibility
      enableProxies = false, // Not directly used in Firecrawl but kept for compatibility
      enableMetadata = true,
      enableAntiBot = false, // Not directly used in Firecrawl but kept for compatibility
      enableFullResources = false, // Not directly used in Firecrawl but kept for compatibility
      enableSubdomains = false,
      enableTlds = false // Handled differently in Firecrawl
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
        
        // Prepare the request body for Firecrawl API - FIX: Updated to match Firecrawl API requirements
        const firecrawlRequestBody = {
          url: url,
          limit: limit,
          scrapeOptions: {
            formats: [returnFormat]
            // Remove metadata key as it's not supported in Firecrawl API
          },
          allowSubdomains: enableSubdomains,
          // Firecrawl-specific settings, mapped from our original options
          allowBackwardLinks: enableTlds // Using this as equivalent to TLDs in Spider.cloud
        };
        
        // Log the Firecrawl API request configuration
        await updateSourceWithLog(
          supabase, 
          sourceId, 
          "info", 
          `Sending request to Firecrawl API`, 
          {
            request_body: firecrawlRequestBody,
            api_endpoint: "https://api.firecrawl.dev/v1/crawl"
          }
        );
        
        console.log("Firecrawl API request:", JSON.stringify(firecrawlRequestBody));
        
        // Start timing the API call
        const apiCallStartTime = Date.now();
        
        // Call Firecrawl API for crawling
        const crawlResponse = await fetch('https://api.firecrawl.dev/v1/crawl', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(firecrawlRequestBody),
        });

        const apiCallDuration = Date.now() - apiCallStartTime;
        
        // Log response status and headers
        console.log(`Firecrawl API response status: ${crawlResponse.status} (took ${apiCallDuration}ms)`);
        console.log(`Firecrawl API response headers:`, Object.fromEntries(crawlResponse.headers.entries()));
        
        // Log the API response details
        await updateSourceWithLog(
          supabase, 
          sourceId, 
          crawlResponse.ok ? "info" : "error", 
          `Received response from Firecrawl API (${crawlResponse.status})`, 
          {
            status: crawlResponse.status,
            statusText: crawlResponse.statusText,
            headers: Object.fromEntries(crawlResponse.headers.entries()),
            duration_ms: apiCallDuration
          }
        );

        if (!crawlResponse.ok) {
          const errorData = await crawlResponse.text();
          console.error('Firecrawl API error:', errorData);
          
          await updateSourceWithLog(
            supabase, 
            sourceId, 
            "error", 
            `Firecrawl API returned error: ${crawlResponse.status} ${crawlResponse.statusText}`, 
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
                error: `Firecrawl API error: ${errorData}`,
                crawl_options: firecrawlRequestBody
              })
            })
            .eq('id', sourceId);

          return;
        }

        const initialResponse = await crawlResponse.json();
        await updateSourceWithLog(
          supabase, 
          sourceId, 
          "info", 
          `Crawl job initiated with Firecrawl. Job ID: ${initialResponse.id}`, 
          {
            job_id: initialResponse.id,
            status_url: initialResponse.url
          }
        );
        
        console.log('Firecrawl job initiated:', initialResponse);
        
        // Now poll for the crawl results
        let isCrawlComplete = false;
        let crawlData: any[] = [];
        let pollAttempts = 0;
        const maxPollAttempts = 60; // Maximum number of polling attempts (30 minutes at 30-second intervals)
        const pollInterval = 30000; // 30 seconds between polls
        
        await updateSourceWithLog(
          supabase, 
          sourceId, 
          "info", 
          `Starting to poll for crawl results. Will check every ${pollInterval/1000} seconds.`
        );
        
        while (!isCrawlComplete && pollAttempts < maxPollAttempts) {
          pollAttempts++;
          
          await updateSourceWithLog(
            supabase, 
            sourceId, 
            "info", 
            `Polling for crawl results (attempt ${pollAttempts}/${maxPollAttempts})`
          );
          
          // Wait before polling
          await new Promise(resolve => setTimeout(resolve, pollInterval));
          
          // Poll for status
          const statusResponse = await fetch(initialResponse.url, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (!statusResponse.ok) {
            const errorData = await statusResponse.text();
            console.error(`Error polling crawl status (attempt ${pollAttempts}):`, errorData);
            
            await updateSourceWithLog(
              supabase, 
              sourceId, 
              "warning", 
              `Error polling crawl status: ${statusResponse.status}`, 
              { error_details: errorData }
            );
            
            // Continue polling despite errors
            continue;
          }
          
          const statusData = await statusResponse.json();
          
          // Update the source with current status
          await updateSourceWithLog(
            supabase, 
            sourceId, 
            "info", 
            `Crawl status update: ${statusData.status}`, 
            { 
              completed: statusData.completed,
              total: statusData.total,
              credits_used: statusData.creditsUsed,
              expires_at: statusData.expiresAt
            }
          );
          
          // Check if we have data and if the crawl is complete
          if (statusData.data && Array.isArray(statusData.data)) {
            crawlData = crawlData.concat(statusData.data);
            
            await updateSourceWithLog(
              supabase, 
              sourceId, 
              "info", 
              `Received ${statusData.data.length} pages in this batch. Total pages so far: ${crawlData.length}`
            );
          }
          
          // If status is completed or we have all the data, we can stop polling
          if (statusData.status === 'completed' || 
              (statusData.completed && statusData.total && statusData.completed >= statusData.total)) {
            isCrawlComplete = true;
            
            await updateSourceWithLog(
              supabase, 
              sourceId, 
              "info", 
              `Crawl completed successfully. Processing data...`, 
              {
                pages_received: crawlData.length,
                requested_limit: limit,
                completed_pages: statusData.completed,
                total_pages: statusData.total
              }
            );
            
            break;
          }
          
          // If there's a next URL to fetch more data, get it now
          if (statusData.next) {
            await updateSourceWithLog(
              supabase, 
              sourceId, 
              "info", 
              `Fetching next batch of results from: ${statusData.next}`
            );
            
            // Fetch the next batch
            const nextResponse = await fetch(statusData.next, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
                'Content-Type': 'application/json',
              },
            });
            
            if (nextResponse.ok) {
              const nextData = await nextResponse.json();
              
              if (nextData.data && Array.isArray(nextData.data)) {
                crawlData = crawlData.concat(nextData.data);
                
                await updateSourceWithLog(
                  supabase, 
                  sourceId, 
                  "info", 
                  `Received ${nextData.data.length} additional pages. Total pages so far: ${crawlData.length}`
                );
              }
            } else {
              const errorText = await nextResponse.text();
              await updateSourceWithLog(
                supabase, 
                sourceId, 
                "warning", 
                `Error fetching next batch: ${nextResponse.status}`, 
                { error_details: errorText }
              );
            }
          }
        }
        
        if (!isCrawlComplete) {
          await updateSourceWithLog(
            supabase, 
            sourceId, 
            "warning", 
            `Crawl did not complete within maximum polling time (${maxPollAttempts * pollInterval/60000} minutes). Processing available data.`
          );
        }
        
        console.log(`Crawl completed, received ${crawlData.length} pages out of requested limit ${limit}`);
        
        // If no data received, handle error
        if (!crawlData || crawlData.length === 0) {
          await updateSourceWithLog(
            supabase, 
            sourceId, 
            "error", 
            `No pages received from crawl`
          );
          
          // Update the source record with the error
          await supabase
            .from('agent_sources')
            .update({
              content: JSON.stringify({
                url: url,
                status: 'error',
                error: "No pages received from crawl",
                crawl_options: firecrawlRequestBody
              })
            })
            .eq('id', sourceId);
          return;
        }
        
        // Log first 3 pages URLs for debugging
        const sampleUrls = crawlData.slice(0, 3).map(item => {
          return item.metadata?.sourceURL || 'No URL';
        });
        
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
        
        // Prepare content to save in database
        let aggregatedContent = '';
        let contentCount = 0;
        let totalChars = 0;
        let crawledUrls = [];
        let pageSizes = [];
        
        // Process the crawled data
        crawlData.forEach((item, index) => {
          // Get URL from metadata
          const pageUrl = item.metadata?.sourceURL || `Page ${index+1}`;
          crawledUrls.push(pageUrl);
          
          // Get content based on the format requested
          let pageContent = '';
          if (returnFormat === 'markdown' && item.markdown) {
            pageContent = item.markdown;
          } else if (returnFormat === 'html' && item.html) {
            pageContent = item.html;
          } else if (item.text) {
            pageContent = item.text;
          }
          
          if (pageContent) {
            // For debugging
            if (index < 3) {
              console.log(`Page ${index+1} URL: ${pageUrl}, content length: ${pageContent.length}`);
            }
            
            aggregatedContent += `# ${pageUrl}\n\n`;
            aggregatedContent += pageContent + '\n\n';
            contentCount++;
            totalChars += pageContent.length;
            
            pageSizes.push({
              url: pageUrl,
              chars: pageContent.length,
              size_kb: Math.round(pageContent.length / 1024)
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
                crawl_options: firecrawlRequestBody
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
          pagesReceived: crawlData.length,
          pagesWithContent: contentCount,
          totalChars: totalChars,
          originalLength: aggregatedContent.length,
          storedLength: storedContent.length,
          crawledUrls: crawledUrls,
          requestConfig: firecrawlRequestBody,
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
              crawl_report: crawlReport,
              logs: JSON.parse((await supabase.from('agent_sources').select('content').eq('id', sourceId).single()).data.content).logs
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
