
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

    const { url, agentId } = await req.json();
    
    if (!url || !agentId) {
      throw new Error('URL and Agent ID are required');
    }

    // Get user ID from auth
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Error getting user: ' + (userError?.message || 'No user found'));
    }

    // Start the data fetching process
    const spiderApiKey = Deno.env.get('SPIDER_API_KEY');
    if (!spiderApiKey) {
      throw new Error('Spider API key not configured');
    }

    console.log(`Fetching data from Spider API for URL: ${url}`);

    // Call Spider API to fetch stored data
    const spiderResponse = await fetch("https://api.spider.cloud/data/query", {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${spiderApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url })
    });

    if (!spiderResponse.ok) {
      const errorText = await spiderResponse.text();
      throw new Error(`Spider API error: ${spiderResponse.status} - ${errorText}`);
    }

    // Parse the response
    const spiderData = await spiderResponse.json();
    
    if (!Array.isArray(spiderData) || spiderData.length === 0) {
      throw new Error('No data found for this URL in Spider API');
    }

    console.log(`Found ${spiderData.length} pages in Spider API`);

    // Process and save each page to agent_sources
    let successCount = 0;
    
    for (const page of spiderData) {
      if (!page.content || !page.url) continue;
      
      // Create a record in agent_sources
      const content = {
        url: page.url,
        title: page.metadata?.title || page.url,
        content: page.content,
        source: 'spider_api'
      };
      
      const { error: insertError } = await supabaseClient
        .from('agent_sources')
        .insert({
          agent_id: agentId,
          user_id: user.id,
          type: 'website',
          chars: page.content.length,
          content: JSON.stringify(content)
        });
      
      if (insertError) {
        console.error(`Error inserting page ${page.url}:`, insertError);
        continue;
      }
      
      successCount++;
    }

    // Update job status
    await supabaseClient.rpc('update_spider_job_status', { 
      url_param: url,
      agent_id_param: agentId,
      status_param: 'imported',
      count_param: successCount
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully imported ${successCount} pages from Spider API`,
        count: successCount
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
