
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
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Create Supabase client with user's auth
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_ANON_KEY') || '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { url, jobId, agentId } = await req.json();
    
    if (!url || !agentId) {
      throw new Error('URL and Agent ID are required');
    }

    // Get user ID from auth
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Error getting user: ' + (userError?.message || 'No user found'));
    }

    // Standardize URL (add protocol if missing)
    let fullUrl = url;
    if (!url.startsWith('http')) {
      fullUrl = 'https://' + url;
    }

    // Get Spider API key
    const spiderApiKey = Deno.env.get('SPIDER_API_KEY');
    if (!spiderApiKey) {
      throw new Error('Spider API key not configured');
    }

    console.log(`Fetching Spider API data for URL: ${fullUrl}`);

    // Call Spider API to get stored data
    const spiderResponse = await fetch("https://api.spider.cloud/data/query", {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${spiderApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url: fullUrl })
    });

    if (!spiderResponse.ok) {
      const errorText = await spiderResponse.text();
      throw new Error(`Spider API error: ${spiderResponse.status} - ${errorText}`);
    }

    // Parse response as JSON
    const pageDataList = await spiderResponse.json();
    
    if (!Array.isArray(pageDataList) || pageDataList.length === 0) {
      throw new Error('No data found for this URL in Spider API');
    }

    console.log(`Found ${pageDataList.length} pages of content`);

    // Process each page and add to agent_sources
    let totalCharCount = 0;
    const sources = [];

    for (let i = 0; i < pageDataList.length; i++) {
      const page = pageDataList[i];
      
      // Skip pages without content
      if (!page.content || typeof page.content !== 'string') {
        continue;
      }

      const title = page.metadata?.title || page.url || fullUrl;
      const content = page.content;
      const pageUrl = page.url || fullUrl;
      const charCount = content.length;
      totalCharCount += charCount;

      // Add to agent_sources
      const { data: sourceData, error: sourceError } = await supabaseClient
        .from('agent_sources')
        .insert({
          agent_id: agentId,
          user_id: user.id,
          type: 'website',
          content: JSON.stringify({
            url: pageUrl,
            title: title,
            content: content
          }),
          chars: charCount
        })
        .select();

      if (sourceError) {
        console.error(`Error adding page ${i} to agent_sources:`, sourceError);
        continue;
      }

      if (sourceData && sourceData.length > 0) {
        sources.push(sourceData[0]);
        
        // Process source with OpenAI
        try {
          const processResponse = await supabaseClient.functions.invoke('process-agent-source', {
            body: { 
              sourceId: sourceData[0].id, 
              agentId,
              operation: 'add'
            }
          });
          
          if (processResponse.error) {
            console.error(`Error processing page ${i} with OpenAI:`, processResponse.error);
          }
        } catch (processError) {
          console.error(`Error calling process-agent-source for page ${i}:`, processError);
        }
      }
    }

    // Update job status and counts
    if (jobId) {
      await supabaseClient
        .from('spider_jobs')
        .update({
          status: 'imported',
          result_count: sources.length,
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Spider data fetched and added to agent successfully",
        count: sources.length,
        totalChars: totalCharCount,
        sourcesAdded: sources.map(s => ({ id: s.id, chars: s.chars }))
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error("Error in spider-fetch function:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
