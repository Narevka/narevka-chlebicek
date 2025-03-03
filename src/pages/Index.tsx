
import { Link } from "react-router-dom";
import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect.tsx";
import { useAuth } from "@/context/AuthContext.tsx";
import { useIsMobile } from "@/hooks/use-mobile.tsx";
import { SplashCursor } from "@/components/ui/fluid-cursor";
import { StickyScrollDemo } from "@/components/ui/sticky-scroll-demo.tsx";
import { GradientButton } from "@/components/gradient-button";
import { ChevronDown } from "lucide-react";

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

  // Top navigation component
  const TopNav = () => (
    <header className="fixed top-0 left-0 right-0 bg-white bg-opacity-90 backdrop-blur-sm z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <div className="bg-black rounded p-1.5 mr-2">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="font-semibold text-xl">Chatbase</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/affiliates" className="text-gray-600 hover:text-gray-900 font-medium">
              Affiliates
            </Link>
            <Link to="/pricing" className="text-gray-600 hover:text-gray-900 font-medium">
              Pricing
            </Link>
            <div className="relative group">
              <button className="flex items-center text-gray-600 hover:text-gray-900 font-medium">
                Resources
                <ChevronDown size={16} className="ml-1" />
              </button>
              <div className="absolute left-0 mt-2 w-48 bg-white shadow-lg rounded-md py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <Link to="/docs" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Documentation
                </Link>
                <Link to="/blog" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Blog
                </Link>
                <Link to="/tutorials" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Tutorials
                </Link>
              </div>
            </div>
          </div>
          
          {/* Dashboard Button */}
          <div>
            <GradientButton asChild className="w-32 h-10">
              <Link to={user ? "/dashboard" : "/auth"}>
                {user ? "Dashboard" : "Dashboard"}
              </Link>
            </GradientButton>
          </div>
        </div>
      </div>
    </header>
  );

  // Mobile layout with only typing effect and buttons
  if (isMobile) {
    return (
      <div className="flex flex-col min-h-screen">
        <SplashCursor />
        <TopNav />
        <div className="flex-1 flex flex-col justify-between pt-16">
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
      <TopNav />
      <div className="pt-16">
        <StickyScrollDemo />
      </div>
      <div className="fixed top-16 right-0 flex justify-end p-6 z-30">
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
