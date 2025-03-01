
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { SplashCursor } from "@/components/ui/splash-cursor";
import { cn } from "@/lib/utils";

// Content sections for the landing page
const sections = [
  {
    id: "collaborative-editing",
    title: "Collaborative Editing",
    description: "Work together in real time with your team, clients, and stakeholders. Collaborate on documents, share ideas, and make decisions quickly. With our platform, you can streamline your workflow and increase productivity.",
    gradient: "bg-gradient-to-r from-cyan-500 to-teal-500",
    image: "/lovable-uploads/28f23fc0-14a6-4bb2-b492-7a2c9fd18bf7.png"
  },
  {
    id: "real-time-changes",
    title: "Real time changes",
    description: "See changes as they happen. With our platform, you can track every modification in real time. No more confusion about the latest version of your project. Say goodbye to the chaos of version control and embrace the simplicity of real-time updates.",
    gradient: "bg-gradient-to-r from-blue-800 to-indigo-900",
    image: "/lovable-uploads/c26c625d-18f5-4d3b-adf2-9a787781029e.png"
  },
  {
    id: "version-control",
    title: "Version control",
    description: "Experience real-time updates and never stress about version control again. Our platform ensures that you're always working on the most recent version of your project, eliminating the need for constant manual updates. Stay in the loop, keep your team aligned, and maintain the flow of your work without any interruptions.",
    gradient: "bg-gradient-to-r from-orange-500 to-yellow-500",
    image: "/lovable-uploads/52e5df20-adfa-48d2-8786-008c044a8c10.png"
  },
  {
    id: "content-management",
    title: "Running out of content",
    description: "Experience real-time updates and never stress about version control again. Our platform ensures that you're always working on the most recent version of your project, eliminating the need for constant manual updates. Stay in the loop, keep your team aligned, and maintain the flow of your work without any interruptions.",
    gradient: "bg-gradient-to-r from-teal-400 to-cyan-500",
    image: "/lovable-uploads/0d5fdb81-a3cf-4bee-b433-5857da3ffe7b.png"
  },
];

const Index = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [activeSection, setActiveSection] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  // Auto-scroll through sections
  useEffect(() => {
    const interval = setInterval(() => {
      setTransitioning(true);
      setTimeout(() => {
        setActiveSection((prev) => (prev + 1) % sections.length);
        setTransitioning(false);
      }, 500);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Manual navigation
  const goToSection = (index: number) => {
    if (index === activeSection) return;
    setTransitioning(true);
    setTimeout(() => {
      setActiveSection(index);
      setTransitioning(false);
    }, 500);
  };

  return (
    <div className="h-screen w-full overflow-hidden relative flex flex-col">
      <SplashCursor />
      
      {/* Background with gradient */}
      <div
        className={cn(
          "absolute inset-0 transition-colors duration-1000 ease-in-out",
          sections[activeSection].gradient
        )}
      />
      
      {/* Content Container */}
      <div className="relative z-10 flex flex-1 items-center">
        <div className={cn(
          "container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 px-4 transition-opacity duration-500",
          transitioning ? "opacity-0" : "opacity-100"
        )}>
          {/* Text content */}
          <div className="flex flex-col justify-center space-y-6 text-white">
            <h1 className="text-4xl md:text-5xl font-bold">
              {sections[activeSection].title}
            </h1>
            <p className="text-lg opacity-90 max-w-xl">
              {sections[activeSection].description}
            </p>
            
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 pt-4">
              <Button asChild className="bg-white text-black hover:bg-gray-100">
                <Link to="/auth">Get Started</Link>
              </Button>
              <Button asChild variant="outline" className="border-white text-white hover:bg-white/10">
                <Link to="/auth" state={{ isSignUp: true }}>Sign Up</Link>
              </Button>
            </div>
          </div>
          
          {/* Image area */}
          <div className="flex justify-center items-center">
            <div className="relative h-64 md:h-96 w-full overflow-hidden rounded-lg">
              <img
                src={sections[activeSection].image}
                alt={sections[activeSection].title}
                className="w-full h-full object-cover object-center transform transition-transform duration-700 ease-out hover:scale-105"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Navigation dots */}
      <div className="relative z-10 pb-8 flex justify-center">
        <div className="flex space-x-2">
          {sections.map((section, index) => (
            <button
              key={section.id}
              onClick={() => goToSection(index)}
              className={cn(
                "w-3 h-3 rounded-full transition-all",
                index === activeSection
                  ? "bg-white w-8"
                  : "bg-white/50 hover:bg-white/80"
              )}
              aria-label={`Go to ${section.title}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
