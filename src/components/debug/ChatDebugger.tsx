
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { useConversation } from '@/hooks/useConversation';

const ChatDebugger = () => {
  const { user } = useAuth();
  const agentId = localStorage.getItem('debug_agent_id') || '4d68eabd-c403-44d3-99a1-91e7edc1be77';
  const source = "DebugTool";
  
  const {
    messages,
    inputMessage,
    setInputMessage,
    sendingMessage,
    handleSendMessage,
    resetConversation,
    conversationId,
    threadId
  } = useConversation(user?.id, agentId, source);
  
  const [debugData, setDebugData] = useState<Record<string, any>>({});
  
  useEffect(() => {
    const fetchDebugData = () => {
      try {
        const data: Record<string, any> = {};
        const keys = [
          'message_save_attempts',
          'message_save_successes',
          'conversation_create_attempts',
          'conversation_create_successes',
          'conversation_debug_history',
          'assistant_api_calls',
          'assistant_api_responses',
          'assistant_api_errors'
        ];
        
        keys.forEach(key => {
          try {
            const value = localStorage.getItem(key);
            if (value) {
              data[key] = JSON.parse(value);
            } else {
              data[key] = [];
            }
          } catch (e) {
            data[key] = [`Error parsing ${key}: ${e.message}`];
          }
        });
        
        setDebugData(data);
      } catch (e) {
        console.error("Error getting debug data:", e);
      }
    };
    
    fetchDebugData();
    const interval = setInterval(fetchDebugData, 2000);
    
    return () => clearInterval(interval);
  }, []);
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage(inputMessage);
    }
  };
  
  const clearDebugData = () => {
    const keys = [
      'message_save_attempts',
      'message_save_successes',
      'conversation_create_attempts',
      'conversation_create_successes',
      'conversation_debug_history',
      'assistant_api_calls',
      'assistant_api_responses',
      'assistant_api_errors'
    ];
    
    keys.forEach(key => localStorage.removeItem(key));
    setDebugData({});
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Chat Debugger</span>
          <div className="flex space-x-2">
            <Button variant="destructive" size="sm" onClick={clearDebugData}>
              Clear Debug Data
            </Button>
            <Button variant="outline" size="sm" onClick={resetConversation}>
              Reset Conversation
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="bg-muted p-2 rounded text-xs font-mono overflow-auto h-16">
              <div><strong>User ID:</strong> {user?.id || 'Not logged in'}</div>
              <div><strong>Conversation ID:</strong> {conversationId || 'None'}</div>
              <div><strong>Thread ID:</strong> {threadId || 'None'}</div>
              <div><strong>Agent ID:</strong> {agentId}</div>
              <div><strong>Source:</strong> {source}</div>
            </div>
            
            <div className="border rounded-md p-2 h-80 overflow-y-auto">
              <h3 className="text-sm font-semibold mb-2">Messages</h3>
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`p-2 my-1 rounded ${message.isUser ? 'bg-blue-100 ml-8' : 'bg-gray-100 mr-8'}`}
                >
                  <div className="text-xs text-gray-500">{message.isUser ? 'User' : 'Bot'}</div>
                  <div className="text-sm">{message.content}</div>
                </div>
              ))}
            </div>
            
            <div className="flex space-x-2">
              <input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className="flex-1 p-2 border rounded"
                disabled={sendingMessage}
              />
              <Button 
                onClick={() => handleSendMessage(inputMessage)}
                disabled={sendingMessage || !inputMessage.trim()}
              >
                {sendingMessage ? 'Sending...' : 'Send'}
              </Button>
            </div>
          </div>
          
          <div>
            <Tabs defaultValue="conversation">
              <TabsList className="grid grid-cols-4 mb-2">
                <TabsTrigger value="conversation">Conversation</TabsTrigger>
                <TabsTrigger value="messages">Messages</TabsTrigger>
                <TabsTrigger value="api">API</TabsTrigger>
                <TabsTrigger value="errors">Errors</TabsTrigger>
              </TabsList>
              
              <TabsContent value="conversation" className="h-96 overflow-auto">
                <h3 className="text-sm font-semibold mb-1">Create Attempts</h3>
                <pre className="text-xs bg-gray-100 p-2 rounded mb-2 overflow-auto max-h-32">
                  {JSON.stringify(debugData.conversation_create_attempts || [], null, 2)}
                </pre>
                
                <h3 className="text-sm font-semibold mb-1">Create Successes</h3>
                <pre className="text-xs bg-gray-100 p-2 rounded mb-2 overflow-auto max-h-32">
                  {JSON.stringify(debugData.conversation_create_successes || [], null, 2)}
                </pre>
                
                <h3 className="text-sm font-semibold mb-1">Debug History</h3>
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-64">
                  {JSON.stringify(debugData.conversation_debug_history || [], null, 2)}
                </pre>
              </TabsContent>
              
              <TabsContent value="messages" className="h-96 overflow-auto">
                <h3 className="text-sm font-semibold mb-1">Save Attempts</h3>
                <pre className="text-xs bg-gray-100 p-2 rounded mb-2 overflow-auto max-h-64">
                  {JSON.stringify(debugData.message_save_attempts || [], null, 2)}
                </pre>
                
                <h3 className="text-sm font-semibold mb-1">Save Successes</h3>
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-64">
                  {JSON.stringify(debugData.message_save_successes || [], null, 2)}
                </pre>
              </TabsContent>
              
              <TabsContent value="api" className="h-96 overflow-auto">
                <h3 className="text-sm font-semibold mb-1">API Calls</h3>
                <pre className="text-xs bg-gray-100 p-2 rounded mb-2 overflow-auto max-h-64">
                  {JSON.stringify(debugData.assistant_api_calls || [], null, 2)}
                </pre>
                
                <h3 className="text-sm font-semibold mb-1">API Responses</h3>
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-64">
                  {JSON.stringify(debugData.assistant_api_responses || [], null, 2)}
                </pre>
              </TabsContent>
              
              <TabsContent value="errors" className="h-96 overflow-auto">
                <h3 className="text-sm font-semibold mb-1">API Errors</h3>
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-96">
                  {JSON.stringify(debugData.assistant_api_errors || [], null, 2)}
                </pre>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatDebugger;
