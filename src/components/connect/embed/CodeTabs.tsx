
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";
import CodeSnippet from "@/components/connect/CodeSnippet";

interface CodeTabsProps {
  bubbleCode: string;
  iframeCode: string;
  embedType: "bubble" | "iframe";
  wordpressInstructions: string;
  debugCode: string;
}

const CodeTabs: React.FC<CodeTabsProps> = ({
  bubbleCode,
  iframeCode,
  embedType,
  wordpressInstructions,
  debugCode,
}) => {
  const [platform, setPlatform] = useState<"generic" | "wordpress">("generic");
  
  return (
    <Tabs defaultValue="code" className="mb-6">
      <TabsList>
        <TabsTrigger value="code">Embed Code</TabsTrigger>
        <TabsTrigger value="platform">Platform Instructions</TabsTrigger>
        <TabsTrigger value="debug">Troubleshooting</TabsTrigger>
      </TabsList>
      <TabsContent value="code">
        <CodeSnippet code={embedType === "bubble" ? bubbleCode : iframeCode} />
      </TabsContent>
      <TabsContent value="platform">
        <div className="mb-4">
          <RadioGroup 
            value={platform} 
            onValueChange={(value) => setPlatform(value as "generic" | "wordpress")}
            className="space-y-2 mb-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="generic" id="generic" />
              <Label htmlFor="generic">Generic Website</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="wordpress" id="wordpress" />
              <Label htmlFor="wordpress">WordPress</Label>
            </div>
          </RadioGroup>
          
          {platform === "wordpress" && (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-md my-4">
              <h4 className="font-medium text-blue-800 mb-2">WordPress Instructions</h4>
              <pre className="whitespace-pre-wrap text-sm bg-white p-3 rounded border">{wordpressInstructions}</pre>
            </div>
          )}
          
          <CodeSnippet code={embedType === "bubble" ? bubbleCode : iframeCode} />
        </div>
      </TabsContent>
      <TabsContent value="debug">
        <div className="bg-orange-50 border border-orange-200 p-4 rounded-md mb-4">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-orange-600 mr-2 mt-0.5" />
            <div>
              <h4 className="font-medium text-orange-800">Troubleshooting Embedding Issues</h4>
              <p className="text-orange-700 mt-1">If your chat bubble isn't appearing, check the following:</p>
              <ol className="list-decimal pl-5 mt-2 space-y-1 text-orange-700">
                <li>Verify the domain in your script matches your server URL exactly (including https://)</li>
                <li>Check browser console for errors (F12 or Right-click {'->'} Inspect {'->'} Console)</li>
                <li>Ensure there are no content security policies blocking the script</li>
                <li>Try adding the script right before the closing &lt;/body&gt; tag</li>
                <li>For WordPress sites, try using a plugin like "Header and Footer Scripts"</li>
              </ol>
            </div>
          </div>
        </div>
        <h4 className="font-medium mb-2">Add this debug code to your page:</h4>
        <CodeSnippet code={debugCode} />
      </TabsContent>
    </Tabs>
  );
};

export default CodeTabs;
