
const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// API Routes
// Serve embed.min.js from public directory
app.get('/embed.min.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/embed.min.js'));
});

// Serve the chatbot iframe template
app.get('/chatbot-iframe/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/chatbot-iframe-template.html'));
});

// Serve the standalone chatbot page
app.get('/chatbot/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/chatbot.html'));
});

// Proxy route for chat messages
app.post('/functions/chat-with-assistant', async (req, res) => {
  try {
    const { message, agentId, conversationId } = req.body;
    
    const supabaseUrl = process.env.SUPABASE_URL;
    const functionUrl = `${supabaseUrl}/functions/v1/chat-with-assistant`;
    
    console.log(`Proxying request to ${functionUrl}`);
    
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        message,
        agentId,
        conversationId
      }),
    });
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error proxying request:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

// Serve static files from the public directory
app.use(express.static('public'));

// Serve static files from the dist directory (React build)
// This needs to be after the API routes
if (process.env.NODE_ENV === 'production') {
  // Serve any static files
  app.use(express.static('dist'));

  // Handle React routing, return all requests to React app
  app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

// For Vercel deployment
module.exports = app;

// Start the server if running directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
