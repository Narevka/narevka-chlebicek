
import { Link } from "react-router-dom";
import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect.tsx";
import { useAuth } from "@/context/AuthContext.tsx";
import { useIsMobile } from "@/hooks/use-mobile.tsx";
import { SplashCursor } from "@/components/ui/fluid-cursor";
import { StickyScrollDemo } from "@/components/ui/sticky-scroll-demo.tsx";
import { GradientButton } from "@/components/gradient-button";
import { ArrowRight, CheckCircle } from "lucide-react";

const Index = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  
  const words = [
    {
      text: "Build",
    },
    {
      text: "powerful",
    },
    {
      text: "AI apps",
    },
    {
      text: "with",
    },
    {
      text: "Aceternity.",
      className: "text-blue-500 dark:text-blue-500",
    },
  ];

  const features = [
    { title: "Natural Language Processing", description: "Process and understand human language with ease" },
    { title: "Real-time Data Analysis", description: "Analyze and interpret large datasets instantly" },
    { title: "Automated Workflows", description: "Create complex AI-powered workflows effortlessly" },
    { title: "Chat Interface", description: "Engage users with intuitive conversational UI" },
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
  
  // Enhanced desktop layout with hero section and features
  return (
    <div className="min-h-screen overflow-hidden relative">
      <SplashCursor />
      
      {/* Navigation buttons */}
      <div className="fixed top-0 right-0 flex justify-end p-6 z-50">
        <div className="flex flex-row space-x-4">
          <GradientButton asChild className="w-32 h-10">
            <Link to="/auth">
              Login
            </Link>
          </GradientButton>
          <GradientButton asChild variant="variant" className="w-32 h-10 flex items-center justify-center gap-2">
            <Link to="/auth" state={{ isSignUp: true }}>
              <span>Sign Up</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </GradientButton>
        </div>
      </div>
      
      {/* Hero section with typewriter */}
      <div className="flex flex-col items-center justify-center min-h-[75vh] z-40 relative">
        <div className="absolute inset-0 bg-dot-pattern opacity-20 z-0"></div>
        <div className="text-center z-10 px-6 max-w-4xl">
          <p className="text-neutral-600 dark:text-neutral-300 text-lg mb-3 tracking-wide">
            Unleash the potential of AI for your business
          </p>
          <div className="mb-10">
            <TypewriterEffectSmooth words={words} className="!text-4xl md:!text-5xl lg:!text-6xl font-bold" />
          </div>
          <p className="text-neutral-600 dark:text-neutral-300 text-lg mb-8 max-w-2xl mx-auto">
            Build powerful AI applications without complex coding. Our platform makes AI integration seamless and intuitive.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-16">
            <GradientButton asChild className="h-14 px-8 text-lg">
              <Link to="/auth">
                Get Started Free
              </Link>
            </GradientButton>
            <GradientButton asChild variant="variant" className="h-14 px-8 text-lg">
              <Link to="/auth" state={{ isSignUp: true }}>
                Book a Demo
              </Link>
            </GradientButton>
          </div>
        </div>
      </div>
      
      {/* Features section */}
      <div className="bg-gradient-to-b from-transparent to-neutral-50 dark:to-neutral-900/50 py-20 z-30 relative">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-16">Powerful Features to Transform Your Business</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white/80 dark:bg-neutral-800/50 backdrop-blur-sm p-8 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                <div className="flex items-start gap-4">
                  <CheckCircle className="h-8 w-8 text-blue-500 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-xl mb-2">{feature.title}</h3>
                    <p className="text-neutral-600 dark:text-neutral-300">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Sticky scroll demo remains at the bottom */}
      <div className="h-screen">
        <StickyScrollDemo />
      </div>
    </div>
  );
};

export default Index;
