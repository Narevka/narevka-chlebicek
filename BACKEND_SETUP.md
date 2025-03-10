
# Backend Implementation for Chatbot

This document outlines how to set up the backend services required for the chatbot to work on your domain.

## Required Backend Services

To make the chatbot work, you need to implement three main components:

1. **Static file hosting**: Serve the `embed.min.js` file from your domain's root
2. **Chatbot iframe endpoint**: Create a route for `/chatbot-iframe/:id` that renders the chatbot interface
3. **API endpoint**: Create an endpoint at `/functions/chat-with-assistant` to handle message exchanges

## Implementation Options

### Option 1: Use the Simple Express Server (Recommended)

We've included a simple Express server that can handle all the requirements:

1. Install Node.js and npm
2. Rename `package-server.json` to `package.json` (or copy its contents to your existing package.json)
3. Install dependencies:
   ```
   npm install
   ```
4. Set environment variables:
   ```
   SUPABASE_URL=https://qaopcduyhmweewrcwkoy.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhb3BjZHV5aG13ZWV3cmN3a295Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4MzM3MjQsImV4cCI6MjA1NjQwOTcyNH0.-IBnucBUA_FMYpx7xKebNhYIXqaems-du5KUvG5T04A
   ```
5. Run the server:
   ```
   node server.js
   ```

### Option 2: Deploy to a Hosting Service

You can deploy the included Express server to various hosting services:

1. **Vercel**: Create a new project and deploy the server
   - Add `vercel.json` with the following content:
   ```json
   {
     "version": 2,
     "builds": [
       { "src": "server.js", "use": "@vercel/node" }
     ],
     "routes": [
       { "src": "/(.*)", "dest": "/server.js" }
     ]
   }
   ```

2. **Netlify**: Deploy with Netlify Functions
   - Create a `netlify.toml` file and deploy using Netlify CLI

3. **Heroku**: Deploy as a Node.js application
   - Follow Heroku's Node.js deployment guide

### Option 3: Use Your Existing Web Server

If you have an existing web server (Apache, Nginx, etc.), you can:

1. Configure it to serve the static files from the `public` directory
2. Set up routes for the chatbot iframe and API endpoints
3. Use a proxy to forward API requests to your Supabase edge function

## Environment Variables

Make sure to set these environment variables in your deployment:

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anonymous key

## Verifying Your Setup

After deploying, test your setup by:

1. Loading `https://yourdomain.com/embed.min.js` in a browser (should download the JS file)
2. Accessing `https://yourdomain.com/chatbot-iframe/test` (should show the chat interface)
3. Testing the API by sending a POST request to `https://yourdomain.com/functions/chat-with-assistant`

## WordPress Integration

To integrate with WordPress:

1. Deploy the server as described above
2. Add the embed script to your WordPress site using a Custom HTML block or by editing your theme
3. Make sure to update the `domain` in the embed script to point to your server
