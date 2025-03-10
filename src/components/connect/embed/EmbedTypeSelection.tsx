
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface EmbedTypeSelectionProps {
  embedType: "bubble" | "iframe";
  setEmbedType: (value: "bubble" | "iframe") => void;
}

const EmbedTypeSelection: React.FC<EmbedTypeSelectionProps> = ({
  embedType,
  setEmbedType,
}) => {
  return (
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
  );
};

export default EmbedTypeSelection;
