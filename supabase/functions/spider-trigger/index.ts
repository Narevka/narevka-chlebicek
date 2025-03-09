
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log("Spider-trigger function invoked");
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error("Missing authorization header");
      throw new Error('No authorization header');
    }

    // Create Supabase client with user's auth
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Missing Supabase environment variables");
      throw new Error('Supabase configuration missing');
    }
    
    console.log("Creating Supabase client");
    const supabaseClient = createClient(
      supabaseUrl,
      supabaseAnonKey,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Parse request data
    let requestData;
    try {
      requestData = await req.json();
      console.log("Received request data:", JSON.stringify(requestData));
    } catch (error) {
      console.error("Error parsing request JSON:", error);
      throw new Error('Invalid JSON in request body');
    }
    
    const { url, agentId, options } = requestData;
    
    // Validate input parameters
    if (!url) {
      console.error("Missing required parameter: url");
      return new Response(
        JSON.stringify({ success: false, error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!agentId) {
      console.error("Missing required parameter: agentId");
      return new Response(
        JSON.stringify({ success: false, error: 'Agent ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user ID from auth
    console.log("Getting authenticated user");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError) {
      console.error("Error getting user:", userError);
      throw new Error('Error getting user: ' + userError.message);
    }
    
    if (!userData || !userData.user) {
      console.error("No authenticated user found");
      throw new Error('No authenticated user found');
    }
    
    console.log("Authenticated user found:", userData.user.id);

    // Check for Spider API key
    const spiderApiKey = Deno.env.get('SPIDER_API_KEY');
    if (!spiderApiKey) {
      console.error("Spider API key not configured in environment variables");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Spider API key not configured. Please add the SPIDER_API_KEY secret in the Supabase dashboard.' 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Starting Spider API crawl for URL: ${url}`);

    // Standardize URL (add protocol if missing)
    let fullUrl = url;
    if (!url.startsWith('http')) {
      fullUrl = 'https://' + url;
    }

    // Default options for web crawling
    const defaultOptions = {
      "url": fullUrl,
      "limit": options?.limit || 100,
      "request": "smart",
      "return_format": "markdown",
      "metadata": true,
      "anti_bot": true,
      "premium_proxy": true,
      "full_resources": true,
      "subdomains": true,
      "store_data": true,
      "cache": true
    };

    // Merge with user options if provided
    const crawlOptions = options ? { ...defaultOptions, ...options } : defaultOptions;

    try {
      // Create a record in spider_jobs table
      console.log("Creating job record in database");
      const { data: jobData, error: jobError } = await supabaseClient
        .from('spider_jobs')
        .insert({
          user_id: userData.user.id,
          agent_id: agentId,
          url: fullUrl,
          status: 'processing'
        })
        .select()
        .single();

      if (jobError) {
        console.error("Error creating job record:", jobError);
        throw new Error('Error creating job record: ' + jobError.message);
      }

      console.log("Created job record:", jobData);

      // Call Spider API to start crawling
      console.log("Calling Spider API with options:", JSON.stringify(crawlOptions));
      const spiderResponse = await fetch("https://api.spider.cloud/crawl", {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${spiderApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(crawlOptions)
      });

      const responseStatus = spiderResponse.status;
      let responseText;
      
      try {
        responseText = await spiderResponse.text();
        console.log(`Spider API response status: ${responseStatus}`);
        console.log(`Spider API response body: ${responseText}`);
      } catch (e) {
        console.error("Error reading Spider API response:", e);
        responseText = "Could not read response";
      }

      if (!spiderResponse.ok) {
        throw new Error(`Spider API error: ${responseStatus} - ${responseText}`);
      }

      // Update job with success status
      await supabaseClient
        .from('spider_jobs')
        .update({
          status: 'completed',
          job_id: jobData.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', jobData.id);

      return new Response(
        JSON.stringify({
          success: true,
          message: "Spider crawling initiated successfully",
          jobId: jobData.id,
          url: fullUrl
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    } catch (spiderError) {
      console.error("Error calling Spider API:", spiderError);
      
      // Update job with error status if job was created
      if (jobData) {
        await supabaseClient
          .from('spider_jobs')
          .update({
            status: 'error',
            updated_at: new Date().toISOString()
          })
          .eq('id', jobData.id);
      }
        
      return new Response(
        JSON.stringify({
          success: false,
          error: spiderError.message
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
  } catch (error) {
    console.error("Error in spider-trigger function:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Unknown server error"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
