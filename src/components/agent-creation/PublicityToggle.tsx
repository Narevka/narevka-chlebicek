
import React from "react";
import { Switch } from "@/components/ui/switch";
import { Globe, Info } from "lucide-react";

interface PublicityToggleProps {
  isPublic: boolean;
  onToggle: (value: boolean) => void;
}

const PublicityToggle: React.FC<PublicityToggleProps> = ({ isPublic, onToggle }) => {
  return (
    <>
      <div className="flex items-center justify-between p-3 border rounded-md bg-gray-50">
        <div className="flex gap-2 items-start">
          <Globe className="h-4 w-4 text-gray-600 mt-0.5" />
          <div>
            <label htmlFor="is-public" className="text-sm font-medium cursor-pointer">
              Make this agent public
            </label>
            <p className="text-xs text-gray-500">
              Allow anyone to use this agent without authentication
            </p>
          </div>
        </div>
        <Switch
          id="is-public"
          checked={isPublic}
          onCheckedChange={onToggle}
        />
      </div>
      
      {!isPublic && (
        <div className="flex p-3 bg-yellow-50 border border-yellow-100 rounded-md">
          <Info className="h-4 w-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
          <p className="text-sm text-yellow-800">
            <strong>Warning:</strong> If you plan to use this agent in a public chatbot, you should set it to public.
            Private agents can only be accessed by authenticated users.
          </p>
        </div>
      )}
      
      {isPublic && (
        <div className="flex p-3 bg-blue-50 border border-blue-100 rounded-md">
          <Info className="h-4 w-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
          <p className="text-sm text-blue-800">
            Public agents can be accessed by anyone who has the link, without requiring login.
            This is ideal for agents embedded on your website.
          </p>
        </div>
      )}
    </>
  );
};

export default PublicityToggle;
