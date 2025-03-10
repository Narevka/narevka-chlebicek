
# Chatbot Application

This repository contains a chatbot application with embedding capabilities.

## Project Structure

- `src/` - React application source code
- `public/` - Static assets and embedding files
- `supabase/` - Supabase edge functions
- `server.js` - Express server for handling embedding and API requests

## Getting Started

### Frontend Development

1. Install dependencies:
```
npm install
```

2. Start the development server:
```
npm run dev
```

### Server for Embedding

To run the server that handles embedding on external websites:

1. Rename `package-server.json` to `package.json` (or merge its contents)
2. Install server dependencies:
```
npm install express cors
```

3. Set environment variables:
```
SUPABASE_URL=https://qaopcduyhmweewrcwkoy.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhb3BjZHV5aG13ZWV3cmN3a295Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4MzM3MjQsImV4cCI6MjA1NjQwOTcyNH0.-IBnucBUA_FMYpx7xKebNhYIXqaems-du5KUvG5T04A
```

4. Run the server:
```
node server.js
```

## Deployment

### Frontend (React App)

Deploy the React application to Vercel, Netlify, or any other static hosting service.

### Server for Embedding

Deploy `server.js` to a service that can run Node.js applications:
- Vercel
- Netlify Functions
- Heroku
- DigitalOcean
- AWS, GCP, or Azure

See `BACKEND_SETUP.md` for detailed deployment instructions.

## Embedding on External Websites

To embed the chatbot on an external website:

1. Add the following script to your HTML:
```html
<script>
  window.chatbaseConfig = {
    chatbotId: "YOUR_AGENT_ID",
    domain: "https://your-server-domain.com",
    title: "AI Assistant",
    description: "Ask me anything!",
    primaryColor: "#6366f1"
  }
  
  (function() {
    if (!window.chatbase || window.chatbase("getState") !== "initialized") {
      window.chatbase = (...arguments) => {
        if (!window.chatbase.q) {
          window.chatbase.q = [];
        }
        window.chatbase.q.push(arguments);
      };
      let s = document.createElement("script");
      s.type = "text/javascript";
      s.async = true;
      s.src = "https://your-server-domain.com/embed.min.js";
      let p = document.getElementsByTagName("script")[0];
      p.parentNode.insertBefore(s, p);
    }
  })();
</script>
```

2. Replace `YOUR_AGENT_ID` with your actual agent ID and `https://your-server-domain.com` with your server domain.

## Documentation

For more information, see:
- `BACKEND_SETUP.md` - Instructions for setting up the backend services
