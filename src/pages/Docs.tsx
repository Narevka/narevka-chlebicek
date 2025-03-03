
import { useState } from "react";
import { ChevronRight } from "lucide-react";

const Docs = () => {
  const [activeSection, setActiveSection] = useState("getting-started");
  
  const sections = [
    { id: "getting-started", label: "Getting Started" },
    { id: "api-reference", label: "API Reference" },
    { id: "sdk", label: "SDK Documentation" },
    { id: "webhooks", label: "Webhooks" },
    { id: "faq", label: "FAQs" },
  ];
  
  const renderContent = () => {
    switch (activeSection) {
      case "getting-started":
        return <GettingStartedContent />;
      case "api-reference":
        return <ApiReferenceContent />;
      case "sdk":
        return <SDKContent />;
      case "webhooks":
        return <WebhooksContent />;
      case "faq":
        return <FAQContent />;
      default:
        return <GettingStartedContent />;
    }
  };
  
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 border-r min-h-screen p-6">
            <h2 className="text-lg font-bold mb-6">Documentation</h2>
            <nav className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                    activeSection === section.id
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {section.label}
                </button>
              ))}
            </nav>
          </div>
          
          {/* Content */}
          <div className="flex-1 p-8">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

const GettingStartedContent = () => (
  <div>
    <h1 className="text-3xl font-bold mb-6">Getting Started with Chatbase</h1>
    <div className="prose max-w-none">
      <p className="lead">
        Welcome to the Chatbase documentation! This guide will help you get up and running with our AI agent platform in just a few minutes.
      </p>
      
      <h2>What is Chatbase?</h2>
      <p>
        Chatbase is the complete platform for building and deploying AI Agents for your business to handle customer support and drive more revenue.
      </p>
      
      <h2>Quick Start</h2>
      <ol>
        <li><strong>Create an account</strong> - Sign up for a free Chatbase account</li>
        <li><strong>Create your first agent</strong> - Use our intuitive interface to build your AI agent</li>
        <li><strong>Train your agent</strong> - Upload your knowledge base to train your agent</li>
        <li><strong>Test your agent</strong> - Use our playground to test how your agent responds</li>
        <li><strong>Deploy your agent</strong> - Add the agent to your website with our simple embed code</li>
      </ol>
      
      <h2>Installation</h2>
      <p>To add Chatbase to your website, simply copy and paste the following code snippet:</p>
      
      <pre className="bg-gray-800 text-gray-100 p-4 rounded-md overflow-x-auto">
        {`<script>
  (function(c,l,a,r,i,t,y){
    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
    t=l.createElement(r);t.async=1;t.src="https://www.chatbase.co/embed.min.js";
    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
  })(window,document,"chatbase","script");
  chatbase("12345678-abcd-1234-efgh-123456789012");
</script>`}
      </pre>
      
      <h2>Next Steps</h2>
      <p>
        Once you've completed the quick start guide, you can explore our more advanced features:
      </p>
      <ul>
        <li>Customize your agent's appearance</li>
        <li>Set up webhooks for event notifications</li>
        <li>Integrate with your existing systems via our API</li>
        <li>Analyze conversation data with our analytics dashboard</li>
      </ul>
    </div>
  </div>
);

const ApiReferenceContent = () => (
  <div>
    <h1 className="text-3xl font-bold mb-6">API Reference</h1>
    <div className="prose max-w-none">
      <p>
        Our REST API provides programmatic access to Chatbase functionality. This reference documents the endpoints available in the API and how to use them.
      </p>
      
      <h2>Authentication</h2>
      <p>
        All API requests require authentication. To authenticate, include your API key in the header of all requests:
      </p>
      <pre className="bg-gray-800 text-gray-100 p-4 rounded-md overflow-x-auto">
        {`Authorization: Bearer YOUR_API_KEY`}
      </pre>
      
      <h2>Base URL</h2>
      <p>All API endpoints are relative to: <code>https://api.chatbase.co/v1</code></p>
      
      <h2>Endpoints</h2>
      <div className="space-y-6">
        <div className="border-l-4 border-green-500 pl-4">
          <h3 className="text-xl">GET /agents</h3>
          <p>Retrieves a list of all agents associated with your account.</p>
        </div>
        <div className="border-l-4 border-blue-500 pl-4">
          <h3 className="text-xl">POST /agents</h3>
          <p>Creates a new agent.</p>
        </div>
        <div className="border-l-4 border-green-500 pl-4">
          <h3 className="text-xl">GET /agents/:id</h3>
          <p>Retrieves details about a specific agent.</p>
        </div>
        <div className="border-l-4 border-yellow-500 pl-4">
          <h3 className="text-xl">PUT /agents/:id</h3>
          <p>Updates an existing agent.</p>
        </div>
        <div className="border-l-4 border-red-500 pl-4">
          <h3 className="text-xl">DELETE /agents/:id</h3>
          <p>Deletes an agent.</p>
        </div>
      </div>
    </div>
  </div>
);

const SDKContent = () => (
  <div>
    <h1 className="text-3xl font-bold mb-6">SDK Documentation</h1>
    <div className="prose max-w-none">
      <p>
        Our SDKs make it easy to integrate Chatbase functionality into your applications. We currently provide SDKs for the following platforms:
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        <div className="border rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">JavaScript SDK</h3>
          <p>Perfect for web applications and browser-based integrations.</p>
          <pre className="bg-gray-800 text-gray-100 p-4 rounded-md overflow-x-auto mt-4">
            {`npm install @chatbase/js-sdk`}
          </pre>
          <a href="#" className="inline-flex items-center text-blue-600 hover:text-blue-800 mt-4">
            View docs <ChevronRight size={16} />
          </a>
        </div>
        
        <div className="border rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Python SDK</h3>
          <p>Ideal for backend applications, data science, and automation.</p>
          <pre className="bg-gray-800 text-gray-100 p-4 rounded-md overflow-x-auto mt-4">
            {`pip install chatbase-python`}
          </pre>
          <a href="#" className="inline-flex items-center text-blue-600 hover:text-blue-800 mt-4">
            View docs <ChevronRight size={16} />
          </a>
        </div>
        
        <div className="border rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Node.js SDK</h3>
          <p>For server-side JavaScript applications and integrations.</p>
          <pre className="bg-gray-800 text-gray-100 p-4 rounded-md overflow-x-auto mt-4">
            {`npm install @chatbase/node-sdk`}
          </pre>
          <a href="#" className="inline-flex items-center text-blue-600 hover:text-blue-800 mt-4">
            View docs <ChevronRight size={16} />
          </a>
        </div>
        
        <div className="border rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">React Native SDK</h3>
          <p>For building mobile apps with React Native.</p>
          <pre className="bg-gray-800 text-gray-100 p-4 rounded-md overflow-x-auto mt-4">
            {`npm install @chatbase/react-native-sdk`}
          </pre>
          <a href="#" className="inline-flex items-center text-blue-600 hover:text-blue-800 mt-4">
            View docs <ChevronRight size={16} />
          </a>
        </div>
      </div>
    </div>
  </div>
);

const WebhooksContent = () => (
  <div>
    <h1 className="text-3xl font-bold mb-6">Webhooks</h1>
    <div className="prose max-w-none">
      <p>
        Webhooks allow you to receive real-time notifications when specific events occur in your Chatbase account.
      </p>
      
      <h2>Setting up Webhooks</h2>
      <p>
        To set up a webhook, you need to:
      </p>
      <ol>
        <li>Create an endpoint on your server to receive the webhook payload</li>
        <li>Register the webhook URL in your Chatbase dashboard</li>
        <li>Select the events you want to receive notifications for</li>
      </ol>
      
      <h2>Available Events</h2>
      <div className="overflow-x-auto">
        <table className="w-full mt-4 border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 text-left border">Event</th>
              <th className="py-2 px-4 text-left border">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-2 px-4 border">conversation.started</td>
              <td className="py-2 px-4 border">Triggered when a new conversation is started with an agent</td>
            </tr>
            <tr>
              <td className="py-2 px-4 border">conversation.ended</td>
              <td className="py-2 px-4 border">Triggered when a conversation is ended</td>
            </tr>
            <tr>
              <td className="py-2 px-4 border">message.created</td>
              <td className="py-2 px-4 border">Triggered when a new message is created</td>
            </tr>
            <tr>
              <td className="py-2 px-4 border">agent.created</td>
              <td className="py-2 px-4 border">Triggered when a new agent is created</td>
            </tr>
            <tr>
              <td className="py-2 px-4 border">agent.updated</td>
              <td className="py-2 px-4 border">Triggered when an agent is updated</td>
            </tr>
            <tr>
              <td className="py-2 px-4 border">agent.deleted</td>
              <td className="py-2 px-4 border">Triggered when an agent is deleted</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <h2>Webhook Payload</h2>
      <p>
        Webhook payloads are sent as HTTP POST requests with a JSON body. Here's an example payload for a <code>message.created</code> event:
      </p>
      <pre className="bg-gray-800 text-gray-100 p-4 rounded-md overflow-x-auto mt-4">
        {`{
  "event": "message.created",
  "timestamp": "2023-05-10T15:30:45Z",
  "data": {
    "message_id": "msg_123456",
    "conversation_id": "conv_789012",
    "agent_id": "agent_345678",
    "content": "Hello, how can I help you?",
    "sender_type": "agent",
    "created_at": "2023-05-10T15:30:45Z"
  }
}`}
      </pre>
    </div>
  </div>
);

const FAQContent = () => (
  <div>
    <h1 className="text-3xl font-bold mb-6">Frequently Asked Questions</h1>
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold mb-2">What is Chatbase?</h3>
        <p className="text-gray-700">
          Chatbase is a platform that allows you to create, train, and deploy AI agents for customer support and engagement. Our AI agents can understand natural language, learn from your knowledge base, and provide accurate responses to customer inquiries.
        </p>
      </div>
      
      <div>
        <h3 className="text-xl font-semibold mb-2">How do I create my first AI agent?</h3>
        <p className="text-gray-700">
          After signing up for a Chatbase account, you can create your first agent by clicking the "Create Agent" button on your dashboard. Follow the setup wizard to name your agent, upload your knowledge base, and customize its behavior.
        </p>
      </div>
      
      <div>
        <h3 className="text-xl font-semibold mb-2">What kind of knowledge can I upload to my agent?</h3>
        <p className="text-gray-700">
          You can upload various types of documents including PDFs, Word documents, text files, and even URLs to websites. Our system will automatically extract the relevant information and use it to train your agent.
        </p>
      </div>
      
      <div>
        <h3 className="text-xl font-semibold mb-2">How does Chatbase handle sensitive information?</h3>
        <p className="text-gray-700">
          Chatbase takes data security seriously. All data is encrypted both in transit and at rest. We also offer data processing agreements and compliance with various regulations such as GDPR and CCPA.
        </p>
      </div>
      
      <div>
        <h3 className="text-xl font-semibold mb-2">Can I customize the appearance of my chatbot?</h3>
        <p className="text-gray-700">
          Yes, Chatbase offers extensive customization options. You can change the colors, fonts, and styles to match your brand, add your logo, and customize the chat widget's position and behavior on your website.
        </p>
      </div>
      
      <div>
        <h3 className="text-xl font-semibold mb-2">How do I integrate Chatbase with my existing systems?</h3>
        <p className="text-gray-700">
          Chatbase provides several integration options. You can use our API to connect with your existing systems, set up webhooks for real-time event notifications, or use our SDKs for deeper integrations with your applications.
        </p>
      </div>
      
      <div>
        <h3 className="text-xl font-semibold mb-2">What languages does Chatbase support?</h3>
        <p className="text-gray-700">
          Chatbase supports multiple languages including English, Spanish, French, German, Italian, Portuguese, Dutch, Russian, Chinese, Japanese, and more. We're continuously adding support for additional languages.
        </p>
      </div>
      
      <div>
        <h3 className="text-xl font-semibold mb-2">How does billing work?</h3>
        <p className="text-gray-700">
          Chatbase offers tiered pricing plans based on the number of agents and messages. We have a free tier for small businesses and startups, and paid plans for larger organizations with more advanced needs. Check our pricing page for detailed information.
        </p>
      </div>
    </div>
  </div>
);

export default Docs;
