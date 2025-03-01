
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { SplashCursor } from "@/components/ui/splash-cursor";
import { cn } from "@/lib/utils";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";

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
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    container: containerRef,
    offset: ["start start", "end start"],
  });

  // Use motion value event to track scroll progress
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    // Calculate which section should be active based on scroll position
    const sectionBreakpoints = sections.map((_, index) => index / sections.length);
    const closestBreakpointIndex = sectionBreakpoints.reduce(
      (acc, breakpoint, index) => {
        const distance = Math.abs(latest - breakpoint);
        if (distance < Math.abs(latest - sectionBreakpoints[acc])) {
          return index;
        }
        return acc;
      },
      0
    );
    setActiveSection(closestBreakpointIndex);
  });

  // Handle manual navigation
  const goToSection = (index: number) => {
    if (index === activeSection) return;
    
    if (containerRef.current) {
      const sectionHeight = containerRef.current.scrollHeight / sections.length;
      containerRef.current.scrollTo({
        top: index * sectionHeight,
        behavior: 'smooth'
      });
    }
    
    setActiveSection(index);
  };

  return (
    <div className="h-screen w-full overflow-hidden relative flex flex-col">
      <SplashCursor />
      
      {/* Background with gradient */}
      <motion.div
        className="absolute inset-0 transition-colors duration-1000 ease-in-out"
        animate={{
          background: sections[activeSection].gradient.replace('bg-', '')
        }}
        transition={{ duration: 0.8 }}
      />
      
      {/* Scrollable container */}
      <div 
        ref={containerRef}
        className="relative z-10 flex-1 overflow-y-auto hide-scrollbar"
        style={{ scrollSnapType: 'y mandatory' }}
      >
        {sections.map((section, index) => (
          <div 
            key={section.id}
            className="h-screen min-h-screen w-full flex items-center snap-start"
            style={{ scrollSnapAlign: 'start' }}
          >
            <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 px-4">
              {/* Text content */}
              <motion.div 
                className="flex flex-col justify-center space-y-6 text-white"
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: activeSection === index ? 1 : 0.3,
                  y: activeSection === index ? 0 : 20 
                }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-4xl md:text-5xl font-bold">
                  {section.title}
                </h1>
                <p className="text-lg opacity-90 max-w-xl">
                  {section.description}
                </p>
                
                {index === 0 && (
                  <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 pt-4">
                    <Button asChild className="bg-white text-black hover:bg-gray-100">
                      <Link to="/auth">Get Started</Link>
                    </Button>
                    <Button asChild variant="outline" className="border-white text-white hover:bg-white/10">
                      <Link to="/auth" state={{ isSignUp: true }}>Sign Up</Link>
                    </Button>
                  </div>
                )}
              </motion.div>
              
              {/* Image area */}
              <motion.div 
                className="flex justify-center items-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ 
                  opacity: activeSection === index ? 1 : 0.3,
                  scale: activeSection === index ? 1 : 0.9
                }}
                transition={{ duration: 0.5 }}
              >
                <div className="relative h-64 md:h-96 w-full overflow-hidden rounded-lg">
                  <img
                    src={section.image}
                    alt={section.title}
                    className="w-full h-full object-cover object-center transform transition-transform duration-700 ease-out hover:scale-105"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        ))}
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
