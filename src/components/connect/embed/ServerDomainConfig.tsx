
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Info } from "lucide-react";

interface ServerDomainConfigProps {
  customDomain: string;
  setCustomDomain: (domain: string) => void;
  website: string;
  setWebsite: (website: string) => void;
  agentId: string | undefined;
}

const ServerDomainConfig: React.FC<ServerDomainConfigProps> = ({
  customDomain,
  setCustomDomain,
  website,
  setWebsite,
  agentId,
}) => {
  return (
    <>
      <h3 className="text-xl font-medium mb-2">Server domain</h3>
      <div className="mb-4">
        <Label htmlFor="customDomain">Custom Domain</Label>
        <Input 
          id="customDomain" 
          value={customDomain} 
          onChange={(e) => setCustomDomain(e.target.value)} 
          className="max-w-md"
          placeholder={window.location.origin}
        />
        <p className="text-sm text-gray-500 mt-1">
          Enter the full URL (including https://) where your chatbot server is hosted. By default, this can be your Vercel app URL.
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
            Your server at <strong>{customDomain}</strong> is already configured with the necessary backend services through Vercel:
          </p>
          <ul className="list-disc pl-5 mt-2 text-amber-700">
            <li>The <code>/embed.min.js</code> file is served from your Vercel domain</li>
            <li>The <code>/chatbot-iframe/{agentId}</code> endpoint is configured</li>
            <li>Your domain handles API calls from the chatbot client</li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default ServerDomainConfig;
