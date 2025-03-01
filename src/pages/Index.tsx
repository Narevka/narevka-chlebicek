
import { Link } from "react-router-dom";
import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { SplashCursor } from "@/components/ui/splash-cursor";
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

  // Content for the sticky scroll component with 4 items
  const stickyScrollContent = [
    {
      title: "Collaborative Editing",
      description:
        "Work together in real time with your team, clients, and stakeholders. Collaborate on documents, share ideas, and make decisions quickly. With our platform, you can streamline your workflow and increase productivity.",
      content: (
        <div className="h-full w-full bg-gradient-to-r from-purple-900 to-indigo-800 rounded-lg flex items-center justify-center text-white p-6">
          <img 
            src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158" 
            alt="Collaborative Editing" 
            className="rounded-lg object-cover h-[90%] w-[90%] shadow-xl"
          />
        </div>
      ),
    },
    {
      title: "Real time changes",
      description:
        "See changes as they happen. With our platform, you can track every modification in real time. No more confusion about the latest version of your project. Say goodbye to the chaos of version control and embrace the simplicity of real-time updates.",
      content: (
        <div className="h-full w-full bg-gradient-to-r from-blue-900 to-cyan-800 rounded-lg flex items-center justify-center p-6">
          <img 
            src="/lovable-uploads/c335196c-338d-475e-a31a-ce801c015619.png" 
            alt="Real time changes" 
            className="rounded-lg object-cover h-[90%] w-[90%] shadow-xl"
          />
        </div>
      ),
    },
    {
      title: "Version control",
      description:
        "Experience real-time updates and never stress about version control again. Our platform ensures that you're always working on the most recent version of your project, eliminating the need for constant manual updates. Stay in the loop, keep your team aligned, and maintain the flow of your work without any interruptions.",
      content: (
        <div className="h-full w-full bg-gradient-to-r from-teal-900 to-emerald-800 rounded-lg flex items-center justify-center p-6">
          <img 
            src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d" 
            alt="Version control" 
            className="rounded-lg object-cover h-[90%] w-[90%] shadow-xl"
          />
        </div>
      ),
    },
    {
      title: "Advanced Analytics",
      description:
        "Get detailed insights into your projects with powerful analytics tools. Track progress, monitor team performance, and identify bottlenecks to optimize your workflow. Make data-driven decisions to improve efficiency and deliver better results.",
      content: (
        <div className="h-full w-full bg-gradient-to-r from-orange-900 to-amber-800 rounded-lg flex items-center justify-center p-6">
          <img 
            src="/lovable-uploads/5014a49e-97ee-4351-b5bf-cb2322807db8.png" 
            alt="Advanced Analytics" 
            className="rounded-lg object-cover h-[90%] w-[90%] shadow-xl"
          />
        </div>
      ),
    },
  ];

  // Mobile layout
  if (isMobile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black px-4">
        <SplashCursor />
        <div className="max-w-3xl w-full space-y-8 text-center">
          <p className="text-neutral-400 text-base mb-2">
            The road to freedom starts from here
          </p>
          
          <TypewriterEffectSmooth words={words} />
          
          <div className="flex flex-col space-y-4 mt-8">
            <Button asChild className="w-full h-12 bg-white text-black rounded-md">
              <Link to="/auth">
                Join now
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full h-12 rounded-md border-2 border-white text-white">
              <Link to="/auth" state={{ isSignUp: true }}>
                Signup
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  // Desktop layout with full-page sticky scroll
  return (
    <div className="h-screen w-full overflow-hidden bg-black">
      <SplashCursor />
      
      <div className="h-full w-full">
        <StickyScroll content={stickyScrollContent} />
        
        {/* Fixed buttons at the bottom of the page */}
        <div className="fixed bottom-10 left-0 w-full flex justify-center gap-6 z-10">
          <Button asChild className="w-40 h-12 bg-white text-black rounded-md">
            <Link to="/auth">
              Join now
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-40 h-12 rounded-md border-2 border-white text-white">
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
