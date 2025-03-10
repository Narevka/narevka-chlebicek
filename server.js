
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
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Query params: ${JSON.stringify(req.query)}`);
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

// Serve the chatbot iframe template - capture and forward source parameter
app.get('/chatbot-iframe/:id', (req, res) => {
  // Capture the source parameter for conversation tracking
  // Make sure to normalize the source value
  let source = req.query.source || 'Website';
  
  // Normalize WordPress source (ensure consistent casing)
  if (typeof source === 'string' && source.toLowerCase() === 'wordpress') {
    source = 'WordPress';
  }
  
  console.log(`Chatbot iframe requested for agent ${req.params.id} with source: ${source}`);
  
  // Read the template file
  fs.readFile(path.join(__dirname, 'public/chatbot-iframe-template.html'), 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading chatbot template:', err);
      return res.status(500).send('Error loading chatbot');
    }
    
    // Replace existing source value or add it if not present
    let modifiedTemplate;
    if (data.includes('window.chatbaseConfig')) {
      if (data.includes('source:')) {
        // Replace existing source
        modifiedTemplate = data.replace(
          /source:.*?"(.+?)"/g, 
          `source: "${source}"`
        );
      } else {
        // Add source if not present
        modifiedTemplate = data.replace(
          /window\.chatbaseConfig\s*=\s*{/g, 
          `window.chatbaseConfig = {\n    source: "${source}",`
        );
      }
    } else {
      // If no config, add it (unlikely case)
      modifiedTemplate = data.replace(
        /<head>/,
        `<head>\n<script>window.chatbaseConfig = { source: "${source}" };</script>`
      );
    }
    
    res.send(modifiedTemplate);
  });
});

// Serve the standalone chatbot page
app.get('/chatbot/:id', (req, res) => {
  let source = req.query.source || 'Website';
  
  // Normalize WordPress source
  if (typeof source === 'string' && source.toLowerCase() === 'wordpress') {
    source = 'WordPress';
  }
  
  console.log(`Standalone chatbot requested for agent ${req.params.id} with source: ${source}`);
  
  // Read the template file
  fs.readFile(path.join(__dirname, 'public/chatbot.html'), 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading chatbot template:', err);
      return res.status(500).send('Error loading chatbot');
    }
    
    // Insert or update the source parameter in the template
    let modifiedTemplate;
    if (data.includes('source:')) {
      // Replace existing source
      modifiedTemplate = data.replace(
        /source:.*?"(.+?)"/g, 
        `source: "${source}"`
      );
    } else {
      // Add source if not present
      modifiedTemplate = data.replace(
        /window\.chatbaseConfig\s*=\s*{/g, 
        `window.chatbaseConfig = {\n    source: "${source}",`
      );
    }
    
    res.send(modifiedTemplate);
  });
});

// Proxy route for chat messages
app.post('/functions/chat-with-assistant', async (req, res) => {
  try {
    const { message, agentId, conversationId } = req.body;
    
    // Capture source if provided in the request, normalize if it's WordPress
    let source = req.body.source || 'Website';
    if (typeof source === 'string' && source.toLowerCase() === 'wordpress') {
      source = 'WordPress';
    }
    
    const supabaseUrl = process.env.SUPABASE_URL;
    const functionUrl = `${supabaseUrl}/functions/v1/chat-with-assistant`;
    
    console.log(`Proxying request to ${functionUrl}`, { 
      message, 
      agentId, 
      conversationId,
      source
    });
    
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
        source
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
