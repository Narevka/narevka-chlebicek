
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import ChatDebugger from '@/components/debug/ChatDebugger';

const DebugChat = () => {
  const { user } = useAuth();
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Chat Debug Tool</h1>
      
      {!user ? (
        <div className="p-4 bg-yellow-100 rounded mb-4">
          <p className="font-medium">Please log in to use the debug tool.</p>
        </div>
      ) : (
        <ChatDebugger />
      )}
      
      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h2 className="text-lg font-semibold mb-2">Instructions</h2>
        <ol className="list-decimal pl-6 space-y-2">
          <li>Use this tool to test sending messages and verify they are being saved to the database.</li>
          <li>The debug panels show detailed logs of all operations.</li>
          <li>If messages aren't appearing in Activity &gt; Chat Logs, check the "Save Attempts" and "Save Successes" tabs.</li>
          <li>Check that Conversation IDs are being properly created and used.</li>
          <li>Look for any errors in the API communication.</li>
        </ol>
      </div>
    </div>
  );
};

export default DebugChat;
