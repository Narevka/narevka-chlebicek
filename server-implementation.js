
const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;

// Serve static files
app.use(express.static('public'));
app.use(express.json());

// Endpoint to serve embed.min.js
app.get('/embed.min.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/embed.min.js'));
});

// Endpoint to serve chatbot iframe
app.get('/chatbot-iframe/:id', (req, res) => {
  const chatbotId = req.params.id;
  
  // Read the template file
  fs.readFile(path.join(__dirname, 'public/chatbot-iframe-template.html'), 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading template:', err);
      return res.status(500).send('Error loading chat interface');
    }
    
    // Send the HTML template
    res.send(data);
  });
});

// Endpoint to serve standalone chatbot
app.get('/chatbot/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/chatbot.html'));
});

// Chat API endpoint
app.post('/functions/chat-with-assistant', async (req, res) => {
  try {
    const { message, agentId, conversationId } = req.body;
    
    if (!message || !agentId) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    // This is where you would integrate with your AI backend
    // For now, we'll simulate a response
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate a thread ID if one doesn't exist
    const threadId = conversationId || 'thread_' + Math.random().toString(36).substring(2, 15);
    
    res.json({
      threadId: threadId,
      response: `This is a simulated response to: "${message}"`,
      confidence: 0.9
    });
  } catch (error) {
    console.error('Error in chat API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
