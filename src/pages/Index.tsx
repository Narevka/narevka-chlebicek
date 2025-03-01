
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const Index = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-white">
      <h1 className="text-3xl font-medium text-gray-900 mb-8">Welcome to Narevka's Project</h1>
      
      <div className="flex gap-4">
        {user ? (
          <Button asChild>
            <Link to="/dashboard">Go to Dashboard</Link>
          </Button>
        ) : (
          <>
            <Button asChild variant="default">
              <Link to="/auth">Log in</Link>
            </Button>
            <Button asChild variant="outline" onClick={() => window.location.href = "/auth"}>
              <Link to="/auth" state={{ isSignUp: true }}>Sign up</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
