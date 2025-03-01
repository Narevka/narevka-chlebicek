// src/pages/Index.tsx

import { Link } from "react-router-dom";
import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { SplashCursor } from "@/components/ui/splash-cursor";
import { StickyScroll } from "@/components/ui/sticky-scroll";

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

  // Content for the sticky scroll sections
  const features = [
    {
      title: "Modern UI Components",
      description: "Beautiful interface built with React and Tailwind CSS, ready to use in your projects.",
      content: (
        <div className="h-full w-full bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center text-white text-3xl font-bold">
          UI Components
        </div>
      ),
    },
    {
      title: "Authentication Ready",
      description: "Secure user authentication powered by Supabase, with OAuth and email/password login.",
      content: (
        <div className="h-full w-full bg-gradient-to-br from-pink-500 to-indigo-500 flex items-center justify-center text-white text-3xl font-bold">
          Auth System
        </div>
      ),
    },
    {
      title: "Responsive Design",
      description: "Works perfectly on all devices and screen sizes with mobile-first approach.",
      content: (
        <div className="h-full w-full bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center text-white text-3xl font-bold">
          Responsive
        </div>
      ),
    },
  ];

  // Mobile layout - keep as is
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
  
  // Desktop layout with StickyScroll and SplashCursor
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Add SplashCursor with z-0 to appear behind content */}
      <SplashCursor />
      
      {/* Hero Section with TypewriterEffect */}
      <div className="flex flex-col items-center justify-center py-20 px-4 z-10 relative">
        <p className="text-neutral-600 dark:text-neutral-200 text-lg mb-2">
          The road to freedom starts from here
        </p>
        <TypewriterEffectSmooth words={words} />
        <div className="flex space-x-4 mt-8">
          <Button asChild className="w-40 h-12 bg-black text-white">
            <Link to={user ? "/dashboard" : "/auth"}>
              {user ? "Dashboard" : "Join now"}
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-40 h-12">
            <a href="https://github.com/your-repo" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          </Button>
        </div>
      </div>
      
      {/* StickyScroll Features Section */}
      <div className="w-full z-10 relative mb-16">
        <StickyScroll content={features} />
      </div>
    </div>
  );
};

export default Index;
