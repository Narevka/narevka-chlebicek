
import express from 'express';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// API Routes
// Serve embed.min.js from public directory
app.get('/embed.min.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/embed.min.js'));
});

// Serve chatbot static files
app.get('/chatbot/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'public/chatbot', req.params.filename);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send('File not found');
  }
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
    const { message, agentId, conversationId, dbConversationId, userId } = req.body;
    
    const supabaseUrl = process.env.SUPABASE_URL;
    const functionUrl = `${supabaseUrl}/functions/v1/chat-with-assistant`;
    
    console.log(`Proxying request to ${functionUrl}`, { message, agentId, conversationId, dbConversationId, userId });
    
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        message,
        agentId,
        conversationId,
        dbConversationId,
        userId
      }),
    });
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error proxying request:', error);
    res.status(500).json({ error: 'Failed to process request', details: error.message });
  }
});

// Debug endpoint to check file availability
app.get('/debug-files', (req, res) => {
  try {
    const publicFiles = fs.readdirSync(path.join(__dirname, 'public'));
    const chatbotFiles = fs.existsSync(path.join(__dirname, 'public/chatbot')) 
      ? fs.readdirSync(path.join(__dirname, 'public/chatbot')) 
      : 'chatbot directory not found';
    const distFiles = fs.existsSync(path.join(__dirname, 'dist')) 
      ? fs.readdirSync(path.join(__dirname, 'dist')) 
      : 'dist directory not found';
    
    res.json({
      currentDir: __dirname,
      publicFiles,
      chatbotFiles,
      distFiles,
      env: {
        NODE_ENV: process.env.NODE_ENV,
        PORT: process.env.PORT
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve static files from the public directory (higher priority)
app.use(express.static('public'));

// Serve static files from the dist directory
app.use(express.static('dist'));
app.use(express.static(path.join(__dirname, 'dist')));

// Handle all API routes above, and then handle React routing for everything else
app.get('*', function(req, res) {
  // Check if the request is for an API route
  if (req.path.startsWith('/api/') || req.path.startsWith('/functions/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  // For all other routes, serve the React app
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  
  // Check if index.html exists before serving
  fs.access(indexPath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error(`Error checking for index.html: ${err.message}`);
      return res.status(500).send(`
        <html>
          <head><title>Application Error</title></head>
          <body>
            <h1>Error loading application</h1>
            <p>The application could not be loaded. Please try again later.</p>
            <p>Details: index.html not found in the dist directory.</p>
          </body>
        </html>
      `);
    }
    
    res.sendFile(indexPath);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).send('Internal Server Error');
});

// For Vercel deployment
export default app;

// Start the server if running directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
