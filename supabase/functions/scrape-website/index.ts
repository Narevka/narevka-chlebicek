
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function scrapeUrl(url: string) {
  try {
    console.log(`Scraping URL: ${url}`);
    
    // Fetch the page content
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    
    // Simple extraction of text content from HTML
    // This is a basic implementation, in a production environment
    // you might want to use a more sophisticated HTML parser
    let text = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Extract the title
    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1] : url;
    
    return {
      title,
      content: text,
      url,
      chars: text.length,
    };
  } catch (error) {
    console.error(`Error scraping URL: ${url}`, error);
    throw error;
  }
}

async function findLinks(url: string) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    const baseUrl = new URL(url).origin;
    const urlObj = new URL(url);
    const basePath = urlObj.pathname;
    
    // Extract all links
    const linkRegex = /<a\s+(?:[^>]*?\s+)?href="([^"]*)"[^>]*>/g;
    const links = [];
    let match;
    
    while ((match = linkRegex.exec(html)) !== null) {
      let link = match[1].trim();
      
      // Skip empty links, javascript links, and anchors
      if (!link || link.startsWith('javascript:') || link.startsWith('#')) {
        continue;
      }
      
      // Convert relative links to absolute
      if (link.startsWith('/')) {
        link = `${baseUrl}${link}`;
      } else if (!link.startsWith('http')) {
        // Handle relative links without leading slash
        const pathDir = basePath.substring(0, basePath.lastIndexOf('/') + 1);
        link = `${baseUrl}${pathDir}${link}`;
      }
      
      // Only include links from the same domain
      if (link.startsWith(baseUrl)) {
        links.push(link);
      }
    }
    
    // Return unique links
    return [...new Set(links)];
  } catch (error) {
    console.error(`Error finding links: ${url}`, error);
    throw error;
  }
}

async function parseSitemap(sitemapUrl: string) {
  try {
    const response = await fetch(sitemapUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch sitemap: ${response.status} ${response.statusText}`);
    }

    const xml = await response.text();
    
    // Extract URLs from sitemap
    const urlRegex = /<loc>(.*?)<\/loc>/g;
    const urls = [];
    let match;
    
    while ((match = urlRegex.exec(xml)) !== null) {
      urls.push(match[1]);
    }
    
    return urls;
  } catch (error) {
    console.error(`Error parsing sitemap: ${sitemapUrl}`, error);
    throw error;
  }
}

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

    const { url, operation, agentId, userId, sitemapUrl } = await req.json();
    
    if (!agentId || !userId) {
      throw new Error('Agent ID and User ID are required');
    }

    let result;
    
    if (operation === 'crawl' && url) {
      // Find links on the page for crawling
      const links = await findLinks(url);
      
      // For the initial URL, also scrape and store it
      const urlData = await scrapeUrl(url);
      
      // Save to database
      const { data: sourceData, error: sourceError } = await supabaseClient
        .from('agent_sources')
        .insert([{
          agent_id: agentId,
          user_id: userId,
          type: 'website',
          content: JSON.stringify({
            url: urlData.url,
            title: urlData.title,
            content: urlData.content
          }),
          chars: urlData.chars
        }])
        .select();
        
      if (sourceError) {
        throw new Error(`Error saving source: ${sourceError.message}`);
      }
      
      result = {
        links,
        urlData,
        savedSource: sourceData[0]
      };
    } else if (operation === 'scrape' && url) {
      // Scrape a single URL
      const urlData = await scrapeUrl(url);
      
      // Save to database
      const { data: sourceData, error: sourceError } = await supabaseClient
        .from('agent_sources')
        .insert([{
          agent_id: agentId,
          user_id: userId,
          type: 'website',
          content: JSON.stringify({
            url: urlData.url,
            title: urlData.title,
            content: urlData.content
          }),
          chars: urlData.chars
        }])
        .select();
        
      if (sourceError) {
        throw new Error(`Error saving source: ${sourceError.message}`);
      }
      
      result = {
        urlData,
        savedSource: sourceData[0]
      };
    } else if (operation === 'sitemap' && sitemapUrl) {
      // Parse sitemap to get URLs
      const urls = await parseSitemap(sitemapUrl);
      
      result = {
        urls
      };
    } else {
      throw new Error('Invalid operation or missing parameters');
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Website operation completed successfully",
        result
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error("Error in scrape-website function:", error);
    
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
