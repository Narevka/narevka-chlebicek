
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ClipboardCopy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ShareTabProps {
  agentId: string | undefined;
  customDomain: string;
}

const ShareTab: React.FC<ShareTabProps> = ({ agentId, customDomain }) => {
  const { toast } = useToast();
  
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${customDomain}/chatbot/${agentId}`);
      toast({
        title: "Link copied",
        description: "The link has been copied to your clipboard",
        duration: 3000,
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Could not copy link. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  return (
    <div className="mb-10">
      <h2 className="text-2xl font-semibold mb-4">Share</h2>
      <Card>
        <CardContent className="pt-6">
          <p className="mb-4">
            Share your chatbot with others by providing them with the following link:
          </p>
          <div className="flex max-w-md mb-6">
            <Input 
              value={`${customDomain}/chatbot/${agentId}`}
              readOnly 
              className="rounded-r-none"
            />
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-l-none border-l-0"
              onClick={handleCopyLink}
            >
              <ClipboardCopy className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShareTab;
