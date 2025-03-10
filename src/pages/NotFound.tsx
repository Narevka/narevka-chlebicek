
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  // Check if this is an iframe request for chatbot
  const isChatbotRequest = location.pathname.includes('chatbot-iframe');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-4xl font-bold mb-4 text-gray-800">404</h1>
        <p className="text-xl text-gray-600 mb-6">
          {isChatbotRequest 
            ? "The chatbot iframe could not be loaded. Please check your embed code." 
            : "Oops! Page not found"}
        </p>
        
        {isChatbotRequest ? (
          <div className="text-left mb-6 p-4 bg-gray-50 border border-gray-200 rounded text-sm">
            <p className="text-gray-700 mb-3">Please ensure:</p>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>Your chatbot ID is correct</li>
              <li>You're using the correct embed URL (the one from your Connect page)</li>
              <li>The domain in your config matches the domain of your app</li>
            </ul>
          </div>
        ) : null}
        
        <Button 
          onClick={() => window.history.back()} 
          className="mr-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>
        
        <Button 
          variant="outline" 
          onClick={() => window.location.href = "/"} 
        >
          Return to Home
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
