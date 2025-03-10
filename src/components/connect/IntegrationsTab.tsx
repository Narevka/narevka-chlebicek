
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ClipboardCopy, Check, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import CodeSnippet from "@/components/connect/CodeSnippet";

interface IntegrationsTabProps {
  agentId: string | undefined;
  secretKey: string;
  customDomain: string;
}

const IntegrationsTab: React.FC<IntegrationsTabProps> = ({
  agentId,
  secretKey,
  customDomain
}) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

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
  chatbotId: "${agentId}",
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

  return (
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
  );
};

export default IntegrationsTab;
