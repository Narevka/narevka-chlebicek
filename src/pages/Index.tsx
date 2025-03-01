
import { Link } from "react-router-dom";
import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { SplashCursor } from "@/components/ui/splash-cursor";

const Index = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  
  const words = [
    {
      text: "Build",
    },
    {
      text: "awesome",
    },
    {
      text: "apps",
    },
    {
      text: "with",
    },
    {
      text: "Aceternity.",
      className: "text-blue-500 dark:text-blue-500",
    },
  ];

  // Mobile layout
  if (isMobile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
        <SplashCursor />
        <div className="max-w-3xl w-full space-y-8 text-center">
          <p className="text-neutral-600 dark:text-neutral-200 text-base mb-2">
            The road to freedom starts from here
          </p>
          
          <TypewriterEffectSmooth words={words} />
          
          <div className="flex flex-col space-y-4 mt-8">
            <Button asChild className="w-full h-12 bg-black text-white rounded-md">
              <Link to="/auth">
                Join now
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full h-12 rounded-md border-2">
              <Link to="/auth" state={{ isSignUp: true }}>
                Signup
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  // Desktop layout (minimal version with just buttons)
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <SplashCursor />
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="flex flex-col space-y-4">
          <Button asChild className="w-64 h-12 mx-auto bg-black text-white rounded-md">
            <Link to="/auth">
              Join now
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-64 h-12 mx-auto rounded-md border-2">
            <Link to="/auth" state={{ isSignUp: true }}>
              Signup
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
