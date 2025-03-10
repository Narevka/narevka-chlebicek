
# Backend Implementation for Chatbot

This document outlines how to set up the backend services required for the chatbot to work on your domain (narevka.com).

## Required Backend Services

To make the chatbot work, you need to implement three main components:

1. **Static file hosting**: Serve the `embed.min.js` file from your domain's root
2. **Chatbot iframe endpoint**: Create a route for `/chatbot-iframe/:id` that renders the chatbot interface
3. **API endpoint**: Create an endpoint at `/functions/chat-with-assistant` to handle message exchanges

## Implementation Options

### Option 1: Use the Existing Supabase Edge Function

The project already includes a Supabase edge function (`chat-with-assistant`) that can be used as your backend API. You'll need to:

1. Deploy this function to your own Supabase project
2. Set up proper CORS headers to allow requests from your domain
3. Configure your domain to proxy requests to this function

### Option 2: Implement a Custom Node.js Server

A reference implementation is provided in `server-implementation.js`. To use it:

1. Install Node.js and npm
2. Install required dependencies:
   ```
   npm install express
   ```
3. Run the server:
   ```
   node server-implementation.js
   ```

### Option 3: Implement in Your Preferred Backend Language

You can implement the required endpoints in any backend technology you prefer (PHP, Python, Ruby, etc.). The key requirements are:

1. Serve the static `embed.min.js` file
2. Serve the HTML for the chatbot iframe
3. Implement the chat API endpoint that accepts:
   - `message`: The user's message
   - `agentId`: The ID of the chatbot
   - `conversationId`: (Optional) Thread ID for conversation continuity

## Integration with OpenAI (or Alternative AI Service)

The current implementation in `supabase/functions/chat-with-assistant/index.ts` shows how to integrate with OpenAI's API. You can:

1. Use this as a reference for your own implementation
2. Modify it to use a different AI service
3. Implement caching or other optimizations as needed

## Web Server Configuration

If you're using Nginx as a web server, add these locations to your server configuration:

```nginx
server {
    listen 80;
    server_name www.narevka.com narevka.com;

    # Serve embed.min.js
    location = /embed.min.js {
        alias /path/to/public/embed.min.js;
    }

    # Serve chatbot iframe
    location ~ ^/chatbot-iframe/(.*)$ {
        try_files /public/chatbot-iframe-template.html =404;
    }

    # Serve standalone chatbot
    location ~ ^/chatbot/(.*)$ {
        try_files /public/chatbot.html =404;
    }

    # API endpoint (proxy to your backend)
    location /functions/chat-with-assistant {
        proxy_pass http://localhost:3000/functions/chat-with-assistant;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Testing Your Implementation

After setting up the backend, test it by:

1. Adding the embed script to a test page
2. Checking if the chat bubble appears
3. Sending test messages to verify the API connection

## Monitoring and Troubleshooting

- Check your server logs for any errors
- Use browser developer tools to monitor network requests
- Test API endpoints directly with tools like Postman
