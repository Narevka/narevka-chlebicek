
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ClipboardCopy, Info, AlertTriangle, Check } from "lucide-react";
import { useParams, useLocation } from "react-router-dom";
import { useAgentDetail } from "@/hooks/useAgentDetail";
import { useAuth } from "@/context/AuthContext";
import ConnectSidebar from "@/components/connect/ConnectSidebar";
import CodeSnippet from "@/components/connect/CodeSnippet";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";

const Connect = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { agent, loading } = useAgentDetail(id || "", user?.id);
  const [embedType, setEmbedType] = useState<"bubble" | "iframe">("bubble");
  const [website, setWebsite] = useState("www.example.com");
  const { toast } = useToast();
  const [secretKey] = useState(() => {
    // Generate a random UUID as the secret key if none exists
    // In a real application, this would be stored in the database
    return uuidv4();
  });
  const [copied, setCopied] = useState(false);
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("embed");
  const [customDomain, setCustomDomain] = useState("https://www.narevka.com");

  // Update active tab based on URL hash
  useEffect(() => {
    if (!location.hash || location.hash === "#embed") {
      setActiveTab("embed");
    } else if (location.hash === "#share") {
      setActiveTab("share");
    } else if (location.hash === "#integrations") {
      setActiveTab("integrations");
    }
  }, [location.hash]);

  // Generate dynamic embed codes based on selected options and agent ID
  const bubbleCode = `<script>
  window.chatbaseConfig = {
    chatbotId: "${id}",
    domain: "${customDomain}",
    title: "${agent?.name || 'Chat with our AI'}",
    description: "${agent?.description || 'Ask me anything!'}",
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
      s.src = "${customDomain}/embed.min.js";
      let p = document.getElementsByTagName("script")[0];
      p.parentNode.insertBefore(s, p);
    }
  })();
</script>`;

  const iframeCode = `<iframe
  src="${customDomain}/chatbot-iframe/${id}"
  width="100%"
  style="height: 100%; min-height: 700px"
  frameborder="0"
  title="${agent?.name || 'AI Chat'}"
  allow="microphone"
></iframe>`;

  const serverVerificationCode = `// Node.js example
const crypto = require('crypto');
const secretKey = '${secretKey}'; // Your verification secret key
const userId = 'current_user_id'; // Replace with your user's ID

// Create HMAC for user verification
const hmac = crypto.createHmac('sha256', secretKey)
  .update(userId)
  .digest('hex');

// Add this to your chatbaseConfig
window.chatbaseConfig = {
  chatbotId: "${id}",
  domain: "${customDomain}",
  user: {
    id: userId,
    hmac: hmac
  }
}`;

  const handleCopySecretKey = async () => {
    try {
      await navigator.clipboard.writeText(secretKey);
      setCopied(true);
      toast({
        title: "Secret key copied",
        description: "The secret key has been copied to your clipboard",
        duration: 3000,
      });
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Could not copy secret key. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  // Only show content when agent is loaded
  if (loading) {
    return (
      <div className="flex min-h-screen">
        <ConnectSidebar />
        <div className="flex-1 p-6">
          <h1 className="text-3xl font-bold mb-6">Connect</h1>
          <p>Loading agent details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <ConnectSidebar />
      <div className="flex-1 p-6 overflow-y-auto pb-24">
        <h1 className="text-3xl font-bold mb-6">
          Connect {agent?.name && `"${agent.name}"`}
        </h1>
        
        {activeTab === "embed" && (
          <>
            <div className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">Embed</h2>
              <Card>
                <CardContent className="pt-6">
                  <RadioGroup 
                    value={embedType} 
                    onValueChange={(value) => setEmbedType(value as "bubble" | "iframe")}
                    className="space-y-4"
                  >
                    <div className="flex items-start space-x-4 p-4 border rounded-lg">
                      <RadioGroupItem value="bubble" id="bubble" />
                      <div className="flex-1">
                        <div className="flex items-center">
                          <Label htmlFor="bubble" className="text-lg font-medium">Embed a chat bubble</Label>
                          <span className="ml-2 bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">Recommended</span>
                        </div>
                        <p className="text-gray-500 mt-1">
                          Embed a chat bubble on your website. Allows you to use all the advanced features of the agent.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4 p-4 border rounded-lg">
                      <RadioGroupItem value="iframe" id="iframe" />
                      <div className="flex-1">
                        <Label htmlFor="iframe" className="text-lg font-medium">Embed the iframe directly</Label>
                        <p className="text-gray-500 mt-1">
                          Add the agent anywhere on your website
                        </p>
                      </div>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            </div>

            <div className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">Configuration</h2>
              <Card>
                <CardContent className="pt-6">
                  <div className="mb-6">
                    <h3 className="text-xl font-medium mb-2">Server domain</h3>
                    <div className="mb-4">
                      <Label htmlFor="customDomain">Custom Domain</Label>
                      <Input 
                        id="customDomain" 
                        value={customDomain} 
                        onChange={(e) => setCustomDomain(e.target.value)} 
                        className="max-w-md"
                        placeholder="https://www.narevka.com"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Enter the full URL (including https://) where your chatbot server is hosted
                      </p>
                    </div>
                    
                    <h3 className="text-xl font-medium mb-2 mt-6">On the site</h3>
                    <div className="mb-4">
                      <Label htmlFor="website">Website</Label>
                      <Input 
                        id="website" 
                        value={website} 
                        onChange={(e) => setWebsite(e.target.value)} 
                        className="max-w-md"
                      />
                    </div>
                    
                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-md flex items-start mb-6">
                      <Info className="h-5 w-5 text-amber-600 mr-2 mt-0.5" />
                      <div>
                        <p className="text-amber-800 font-medium">Important</p>
                        <p className="text-amber-700">
                          Make sure that your server at <strong>{customDomain}</strong> has the necessary backend services:
                        </p>
                        <ul className="list-disc pl-5 mt-2 text-amber-700">
                          <li>The <code>/embed.min.js</code> file must be served from your domain</li>
                          <li>The <code>/chatbot-iframe/{id}</code> endpoint must be configured</li>
                          <li>Your domain must handle API calls from the chatbot client</li>
                        </ul>
                      </div>
                    </div>
                    
                    <CodeSnippet code={embedType === "bubble" ? bubbleCode : iframeCode} />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mb-10">
              <h2 className="text-2xl font-semibold mb-4">Required Backend Services</h2>
              <Card>
                <CardContent className="pt-6">
                  <p className="mb-4">To self-host this chatbot on your domain, you need to set up these key components:</p>
                  
                  <ol className="list-decimal pl-5 space-y-3 mb-6">
                    <li className="text-gray-800">
                      <strong>Static file hosting</strong>: Serve the <code>embed.min.js</code> file from your domain's root
                    </li>
                    <li className="text-gray-800">
                      <strong>Chatbot iframe endpoint</strong>: Create a route for <code>/chatbot-iframe/:id</code> that renders the chatbot interface
                    </li>
                    <li className="text-gray-800">
                      <strong>API endpoints</strong>: Set up endpoints to handle message exchanges between the client and your AI backend
                    </li>
                    <li className="text-gray-800">
                      <strong>AI processing</strong>: Configure your own AI service (using OpenAI API or similar) to process user messages
                    </li>
                  </ol>
                  
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-md">
                    <p className="text-blue-800 font-medium mb-2">Setup recommendation</p>
                    <p className="text-blue-700">
                      Consider using a Node.js server with Express to handle API routes and serve static files, 
                      along with a service like Nginx for proxying requests and serving the chatbot interface.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {activeTab === "share" && (
          <div className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">Share</h2>
            <Card>
              <CardContent className="pt-6">
                <p className="mb-4">
                  Share your chatbot with others by providing them with the following link:
                </p>
                <div className="flex max-w-md mb-6">
                  <Input 
                    value={`${customDomain}/chatbot/${id}`}
                    readOnly 
                    className="rounded-r-none"
                  />
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="rounded-l-none border-l-0"
                    onClick={async () => {
                      await navigator.clipboard.writeText(`${customDomain}/chatbot/${id}`);
                      toast({
                        title: "Link copied",
                        description: "The link has been copied to your clipboard",
                        duration: 3000,
                      });
                    }}
                  >
                    <ClipboardCopy className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "integrations" && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">For identity verification</h2>
            <Card>
              <CardContent className="pt-6">
                <div className="mb-6">
                  <h3 className="text-xl font-medium mb-2">On the server</h3>
                  <div className="mb-4">
                    <Label htmlFor="secretKey">Secret key</Label>
                    <div className="flex max-w-md">
                      <Input 
                        id="secretKey" 
                        type="password" 
                        value={secretKey.slice(0, 8) + "•".repeat(20)} 
                        readOnly 
                        className="rounded-r-none font-mono"
                      />
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="rounded-l-none border-l-0"
                        onClick={handleCopySecretKey}
                      >
                        {copied ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <ClipboardCopy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-4 mb-6">
                    <p className="text-gray-600">
                      You'll need to generate an HMAC on your server for each logged-in user and send it to the chatbot.
                    </p>
                    <p className="text-gray-600">
                      You'll need your secret key to add identity verification to your site or app.
                    </p>
                  </div>
                  
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md flex items-start mb-6">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                    <p className="text-yellow-800">
                      Keep your secret key safe! Never commit it directly to your repository, client-side code, or anywhere a third party can find it.
                    </p>
                  </div>
                  
                  <CodeSnippet code={serverVerificationCode} />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Connect;
