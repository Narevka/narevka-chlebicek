import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect";

const Index = () => {
  const { user } = useAuth();
  
  const words = [
    {
      text: "Welcome",
    },
    {
      text: "to",
    },
    {
      text: "Narevka's",
    },
    {
      text: "Project",
      className: "text-blue-500 dark:text-blue-500",
    },
  ];
  
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-white">
      <div className="mb-8">
        <p className="text-neutral-600 dark:text-neutral-200 text-center text-sm mb-2">
          The road to freedom starts from here
        </p>
        <TypewriterEffectSmooth words={words} />
      </div>
      
      <div className="flex gap-4 mt-4">
        {user ? (
          <Button asChild>
            <Link to="/dashboard">Go to Dashboard</Link>
          </Button>
        ) : (
          <>
            <Button asChild className="w-40 h-10 bg-black text-white">
              <Link to="/auth">Join now</Link>
            </Button>
            <Button asChild variant="outline" className="w-40 h-10">
              <Link to="/auth" state={{ isSignUp: true }}>Sign up</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default Index;