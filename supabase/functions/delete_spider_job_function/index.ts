
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log("delete_spider_job_function invoked");
  
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
    
    const { job_id } = requestData;
    
    if (!job_id) {
      console.error("Missing required parameter: job_id");
      return new Response(
        JSON.stringify({ success: false, error: 'Job ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Delete the job directly
    console.log(`Deleting spider job with ID: ${job_id}`);
    const { error } = await supabaseClient
      .from('spider_jobs')
      .delete()
      .eq('id', job_id);
      
    if (error) {
      console.error("Error deleting spider job:", error);
      throw error;
    }

    console.log("Spider job deleted successfully");
    return new Response(
      JSON.stringify({ success: true, message: 'Spider job deleted successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error("Error in delete_spider_job_function:", error);
    
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
