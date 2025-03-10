
const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());

// Serve static files
app.use(express.static('public'));

// Parse JSON request bodies
app.use(express.json());

// Serve embed.min.js from root
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
    
    // URL of your Supabase Edge Function
    const supabaseUrl = process.env.SUPABASE_URL || 'https://qaopcduyhmweewrcwkoy.supabase.co';
    const functionUrl = `${supabaseUrl}/functions/v1/chat-with-assistant`;
    
    console.log(`Proxying request to ${functionUrl}`);
    
    // Forward the request to Supabase
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

// For Vercel serverless functions, we need to export the Express app
module.exports = app;

// Only start the server if this file is run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
