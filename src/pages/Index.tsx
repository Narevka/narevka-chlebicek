
import { Link } from "react-router-dom";
import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect.tsx";
import { useAuth } from "@/context/AuthContext.tsx";
import { useIsMobile } from "@/hooks/use-mobile.tsx";
import { SplashCursor } from "@/components/ui/fluid-cursor";
import { StickyScrollDemo } from "@/components/ui/sticky-scroll-demo.tsx";
import { GradientButton } from "@/components/gradient-button";

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

  // Mobile layout with only typing effect and buttons
  if (isMobile) {
    return (
      <div className="flex flex-col min-h-screen">
        <SplashCursor />
        <div className="flex-1 flex flex-col justify-between">
          {/* Header with typewriter effect */}
          <div className="p-6 pt-12 z-20">
            <p className="text-neutral-600 dark:text-neutral-200 text-base mb-2">
              The road to freedom starts from here
            </p>
            <TypewriterEffectSmooth words={words} />
          </div>
          
          {/* Fixed bottom buttons */}
          <div className="p-6 pb-12 z-30">
            <div className="flex flex-col space-y-4">
              <GradientButton asChild className="w-full h-12">
                <Link to="/auth">
                  Join now
                </Link>
              </GradientButton>
              <GradientButton asChild variant="variant" className="w-full h-12">
                <Link to="/auth" state={{ isSignUp: true }}>
                  Signup
                </Link>
              </GradientButton>
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
      <div className="fixed top-0 right-0 flex justify-end p-6 z-30">
        <div className="flex flex-row space-x-4">
          <GradientButton asChild className="w-32 h-10">
            <Link to="/auth">
              Join now
            </Link>
          </GradientButton>
          <GradientButton asChild variant="variant" className="w-32 h-10">
            <Link to="/auth" state={{ isSignUp: true }}>
              Signup
            </Link>
          </GradientButton>
        </div>
      </div>
    </>
  );
};

export default Index;
