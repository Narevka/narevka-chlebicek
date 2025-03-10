
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const BackendStatus: React.FC = () => {
  return (
    <div className="mb-10">
      <h2 className="text-2xl font-semibold mb-4">Backend Services Status</h2>
      <Card>
        <CardContent className="pt-6">
          <p className="mb-4">Your chatbot backend is hosted on Vercel using the same repository as your app. The required components are:</p>
          
          <ol className="list-decimal pl-5 space-y-3 mb-6">
            <li className="text-gray-800">
              <strong>Static file hosting</strong>: The <code>embed.min.js</code> file is served from your Vercel domain
            </li>
            <li className="text-gray-800">
              <strong>Chatbot iframe endpoint</strong>: The route <code>/chatbot-iframe/:id</code> shows the chatbot interface
            </li>
            <li className="text-gray-800">
              <strong>API endpoint</strong>: The endpoint at <code>/functions/chat-with-assistant</code> handles messages
            </li>
          </ol>
          
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-md">
            <p className="text-blue-800 font-medium mb-2">Vercel Deployment</p>
            <p className="text-blue-700 mb-3">
              When you push your changes to GitHub, Vercel will automatically deploy your updated app with the backend server.
            </p>
            <ul className="list-disc pl-5 text-blue-700 space-y-2">
              <li>Updated <code>vercel.json</code> routes requests correctly to your server</li>
              <li>The Express server handles both static files and API proxying</li>
              <li>No additional hosting services are required</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BackendStatus;
