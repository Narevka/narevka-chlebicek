
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ClipboardCopy, Info, AlertTriangle } from "lucide-react";
import { useParams } from "react-router-dom";
import { useAgentDetail } from "@/hooks/useAgentDetail";
import { useAuth } from "@/context/AuthContext";
import ConnectSidebar from "@/components/connect/ConnectSidebar";
import CodeSnippet from "@/components/connect/CodeSnippet";

const Connect = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { agent, loading } = useAgentDetail(id || "", user?.id);
  const [embedType, setEmbedType] = useState<"bubble" | "iframe">("bubble");
  const [website, setWebsite] = useState("www.example.com");

  // Generate embed codes based on selected options
  const bubbleCode = `<script>
  (function(){if(!window.chatbase||window.chatbase("getState")!=="initialized"){window.chatbase=(...arguments)=>{if(!window.chatbase.q){window.chatbase.q=[];}window.chatbase.q.push(arguments);};
  let s=document.createElement("script");s.type="text/javascript";s.async=true;s.src="https://www.chatbase.co/embed.min.js";
  let p=document.getElementsByTagName("script")[0];p.parentNode.insertBefore(s,p);}})();
</script>`;

  const iframeCode = `<iframe
  src="https://www.chatbase.co/chatbot-iframe/${id}"
  width="100%"
  style="height: 100%; min-height: 700px"
  frameborder="0"
></iframe>`;

  const serverVerificationCode = `const crypto = require('crypto');
const secret = '••••••••••'; // Your verification secret key
const userId = current_user_id; // A string UUID to identify your user

const hash = crypto.createHmac('sha256', secret).update(userId).digest('hex');`;

  return (
    <div className="flex min-h-screen">
      <ConnectSidebar />
      <div className="flex-1 p-6">
        <h1 className="text-3xl font-bold mb-6">Connect</h1>
        
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
                <h3 className="text-xl font-medium mb-2">On the site</h3>
                <div className="mb-4">
                  <Label htmlFor="website">Website</Label>
                  <Input 
                    id="website" 
                    value={website} 
                    onChange={(e) => setWebsite(e.target.value)} 
                    className="max-w-md"
                  />
                </div>
                <CodeSnippet code={embedType === "bubble" ? bubbleCode : iframeCode} />
              </div>
            </CardContent>
          </Card>
        </div>

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
                      value="••••••••••" 
                      readOnly 
                      className="rounded-r-none"
                    />
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="rounded-l-none border-l-0"
                    >
                      <ClipboardCopy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-4 mb-6">
                  <p className="text-gray-600">
                    You'll need to generate an HMAC on your server for each logged-in user and send it to Chatbase.
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
      </div>
    </div>
  );
};

export default Connect;
