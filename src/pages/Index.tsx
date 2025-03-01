
import { Link } from "react-router-dom";
import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { StickyScroll } from "@/components/ui/sticky-scroll-reveal";

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

  // Content for the sticky scroll component
  const stickyScrollContent = [
    {
      title: "Collaborative Editing",
      description:
        "Work together in real-time with your team, without stepping on each other's toes.",
      content: (
        <div className="h-full w-full flex items-center justify-center text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-12 h-12"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
            />
          </svg>
        </div>
      ),
    },
    {
      title: "Advanced Analytics",
      description:
        "Get detailed insights into your projects with powerful analytics tools.",
      content: (
        <div className="h-full w-full flex items-center justify-center text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-12 h-12"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
            />
          </svg>
        </div>
      ),
    },
    {
      title: "Secure Infrastructure",
      description:
        "Enterprise-grade security to keep your data and users safe at all times.",
      content: (
        <div className="h-full w-full flex items-center justify-center text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-12 h-12"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
            />
          </svg>
        </div>
      ),
    },
  ];

  // Mobile layout
  if (isMobile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
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
  
  // Desktop layout with proper StickyScroll implementation
  return (
    <div className="h-screen overflow-hidden bg-black">
      <div className="h-full relative">
        <StickyScroll 
          content={stickyScrollContent}
          contentClassName="lg:h-80 lg:w-96"
        />
        
        {/* Position buttons at the bottom center of the page */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex space-x-6 z-10">
          <Button asChild className="w-40 h-12 bg-white text-black hover:bg-gray-200 rounded-md">
            <Link to="/auth">
              Join now
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-40 h-12 rounded-md border-2 border-white text-white hover:bg-white/10">
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
