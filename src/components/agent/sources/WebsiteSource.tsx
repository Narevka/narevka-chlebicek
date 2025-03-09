
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

const WebsiteSource = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Website</h2>
      
      <div className="mb-6">
        <h3 className="font-medium mb-2">Crawl</h3>
        <div className="flex gap-2 mb-2">
          <Input 
            placeholder="https://www.example.com" 
            className="flex-1"
          />
          <Button>
            Fetch more links
          </Button>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          This will crawl all the links starting with the URL (not including files on the website).
        </p>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-4 text-sm text-gray-500">OR</span>
          </div>
        </div>

        <h3 className="font-medium mb-2">Submit Sitemap</h3>
        <div className="flex gap-2">
          <Input 
            placeholder="https://www.example.com/sitemap.xml" 
            className="flex-1"
          />
          <Button>
            Load additional sitemap
          </Button>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium">Included Links</h3>
          <Button variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50 text-sm">
            Delete all
          </Button>
        </div>

        <div className="space-y-2">
          {/* Example included links */}
          <div className="flex items-center justify-between border rounded-md p-2">
            <div className="flex items-center gap-2">
              <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Trained</div>
              <span className="truncate max-w-md">https://example.com/contact</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-500">444</span>
              <Button variant="ghost" size="sm" className="text-red-500 p-1 h-auto">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between border rounded-md p-2">
            <div className="flex items-center gap-2">
              <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Trained</div>
              <span className="truncate max-w-md">https://example.com/blog</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-500">841</span>
              <Button variant="ghost" size="sm" className="text-red-500 p-1 h-auto">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebsiteSource;
