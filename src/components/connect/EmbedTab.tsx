
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Info } from "lucide-react";
import CodeSnippet from "@/components/connect/CodeSnippet";

interface EmbedTabProps {
  agentId: string | undefined;
  agentName: string | undefined;
  agentDescription: string | undefined;
  customDomain: string;
  setCustomDomain: (domain: string) => void;
}

const EmbedTab: React.FC<EmbedTabProps> = ({
  agentId,
  agentName,
  agentDescription,
  customDomain,
  setCustomDomain,
}) => {
  const [embedType, setEmbedType] = useState<"bubble" | "iframe">("bubble");
  const [website, setWebsite] = useState("www.example.com");

  const bubbleCode = `<script>
  window.chatbaseConfig = {
    chatbotId: "${agentId}",
    domain: "${customDomain}",
    title: "${agentName || 'Chat with our AI'}",
    description: "${agentDescription || 'Ask me anything!'}",
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
  src="${customDomain}/chatbot-iframe/${agentId}"
  width="100%"
  style="height: 100%; min-height: 700px"
  frameborder="0"
  title="${agentName || 'AI Chat'}"
  allow="microphone"
></iframe>`;

  return (
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
                    <li>The <code>/chatbot-iframe/{agentId}</code> endpoint must be configured</li>
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
  );
};

export default EmbedTab;
