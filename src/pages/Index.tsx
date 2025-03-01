
import { Link } from "react-router-dom";
import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect.tsx";
import { Button } from "@/components/ui/button.tsx";
import { useAuth } from "@/context/AuthContext.tsx";
import { useIsMobile } from "@/hooks/use-mobile.tsx";
import { SplashCursor } from "@/components/ui/fluid-cursor";
import { StickyScrollDemo } from "@/components/ui/sticky-scroll-demo.tsx";

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

  // Mobile layout with fixed header and footer
  if (isMobile) {
    return (
      <div className="flex flex-col min-h-screen">
        <SplashCursor />
        <div className="flex-1 flex flex-col">
          {/* Header with typewriter effect */}
          <div className="fixed top-0 left-0 right-0 p-4 z-20 bg-white/80 dark:bg-black/80 backdrop-blur-md">
            <p className="text-neutral-600 dark:text-neutral-200 text-base mb-2">
              The road to freedom starts from here
            </p>
            <TypewriterEffectSmooth words={words} />
          </div>
          
          {/* Main content area */}
          <div className="mt-28 mb-28">
            <StickyScrollDemo />
          </div>
          
          {/* Fixed bottom buttons */}
          <div className="fixed bottom-0 left-0 right-0 p-4 z-30 bg-white/80 dark:bg-black/80 backdrop-blur-md">
            <div className="flex flex-col space-y-4">
              <Button asChild className="w-full h-12 bg-black text-white rounded-md">
                <Link to="/auth">
                  Join now
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full h-12 rounded-md border-2 bg-white/10 backdrop-blur-sm">
                <Link to="/auth" state={{ isSignUp: true }}>
                  Signup
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Desktop layout with fixed sticky scroll
  return (
    <>
      <SplashCursor />
      <StickyScrollDemo />
      <div className="fixed bottom-0 left-0 right-0 flex justify-center p-6 z-30">
        <div className="flex flex-col space-y-4">
          <Button asChild className="w-64 h-12 mx-auto bg-black text-white rounded-md">
            <Link to="/auth">
              Join now
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-64 h-12 mx-auto rounded-md border-2 bg-white/10 backdrop-blur-sm">
            <Link to="/auth" state={{ isSignUp: true }}>
              Signup
            </Link>
          </Button>
        </div>
      </div>
    </>
  );
};

export default Index;
