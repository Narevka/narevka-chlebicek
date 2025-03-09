
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log("get_spider_jobs_function invoked");
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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
    
    const { agent_id_param } = requestData;
    
    if (!agent_id_param) {
      console.error("Missing required parameter: agent_id_param");
      throw new Error('Agent ID is required');
    }

    // Get user ID from auth for verification
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

    // Query the spider_jobs table directly
    console.log(`Fetching spider jobs for agent: ${agent_id_param}`);
    const { data, error } = await supabaseClient
      .from('spider_jobs')
      .select('*')
      .eq('agent_id', agent_id_param);
      
    if (error) {
      console.error("Error fetching spider jobs:", error);
      throw error;
    }
    
    console.log(`Found ${data?.length || 0} spider jobs`);

    return new Response(
      JSON.stringify(data || []),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error("Error in get_spider_jobs_function:", error);
    
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
