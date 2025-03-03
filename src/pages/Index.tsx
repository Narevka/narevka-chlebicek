import { Link } from "react-router-dom";
import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect.tsx";
import { useAuth } from "@/context/AuthContext.tsx";
import { useIsMobile } from "@/hooks/use-mobile.tsx";
import { SplashCursor } from "@/components/ui/fluid-cursor";
import { GradientButton } from "@/components/gradient-button";
import { ChevronDown, ArrowRight, Check, Star, CreditCard, DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

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
      text: "Chatbase.",
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

  return (
    <div className="flex flex-col min-h-screen">
      <SplashCursor />
      <TopNav />
      
      {/* Hero Section */}
      <section className="pt-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-pink-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Build Your AI Chat Assistant in Minutes</h1>
            <p className="text-neutral-600 dark:text-neutral-200 text-lg mb-6 max-w-2xl mx-auto">
              Create, train, and deploy custom chat bots without coding
            </p>
            <TypewriterEffectSmooth words={words} className="mb-8" />
            <div className="flex flex-col sm:flex-row gap-4">
              <GradientButton asChild className="w-full sm:w-auto h-12">
                <Link to="/auth">
                  Start Building Now
                </Link>
              </GradientButton>
              <GradientButton asChild variant="variant" className="w-full sm:w-auto h-12">
                <Link to="/auth" state={{ isSignUp: true }}>
                  Create Free Account
                </Link>
              </GradientButton>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Key Features</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to create powerful AI chat assistants for your business
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Check className="w-8 h-8 text-green-500" />}
              title="No-Code Platform"
              description="Build and deploy AI assistants without any programming knowledge"
            />
            <FeatureCard 
              icon={<Star className="w-8 h-8 text-yellow-500" />}
              title="Custom Training"
              description="Train your bot with your own data and knowledge base"
            />
            <FeatureCard 
              icon={<ArrowRight className="w-8 h-8 text-blue-500" />}
              title="Multi-Channel Integration"
              description="Deploy to website, WhatsApp, Slack, and more with one click"
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-pink-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Create your own AI assistant in just three simple steps
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StepCard 
              number="1"
              title="Create Your Bot"
              description="Sign up and create your first AI assistant with our intuitive interface"
            />
            <StepCard 
              number="2"
              title="Train with Your Data"
              description="Upload documents or connect to your knowledge base to customize responses"
            />
            <StepCard 
              number="3"
              title="Deploy Anywhere"
              description="Integrate with your website, messaging apps, or other platforms with simple embed codes"
            />
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">What Our Customers Say</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join thousands of satisfied customers using Chatbase
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TestimonialCard 
              quote="Chatbase helped us reduce customer service costs by 40% while improving response times."
              author="Sarah Johnson"
              company="Tech Solutions Inc."
            />
            <TestimonialCard 
              quote="Setting up our AI assistant took less than an hour. The ROI has been incredible."
              author="Michael Chen"
              company="Growth Marketing"
            />
            <TestimonialCard 
              quote="Our customers love getting instant answers 24/7. It's been a game-changer for our business."
              author="Emily Rodriguez"
              company="E-commerce Shop"
            />
          </div>
        </div>
      </section>

      {/* Pricing Options Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose the plan that works for your business
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <PricingCard 
              title="Starter"
              price="$29"
              period="/month"
              description="Perfect for small businesses just getting started"
              features={[
                "1 AI Assistant",
                "1,000 messages/month",
                "Standard response time",
                "Email support"
              ]}
              buttonText="Get Started"
              buttonLink="/auth"
              highlighted={false}
            />
            <PricingCard 
              title="Professional"
              price="$79"
              period="/month"
              description="Ideal for growing businesses with more needs"
              features={[
                "3 AI Assistants",
                "10,000 messages/month",
                "Fast response time",
                "Priority support",
                "Custom branding"
              ]}
              buttonText="Get Started"
              buttonLink="/auth"
              highlighted={true}
            />
            <PricingCard 
              title="Enterprise"
              price="$199"
              period="/month"
              description="For businesses with advanced requirements"
              features={[
                "Unlimited AI Assistants",
                "50,000 messages/month",
                "Fastest response time",
                "24/7 dedicated support",
                "Custom integrations",
                "Advanced analytics"
              ]}
              buttonText="Contact Sales"
              buttonLink="/auth"
              highlighted={false}
            />
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-pink-100 to-pink-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Customer Experience?</h2>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of businesses already using Chatbase to provide exceptional service
          </p>
          <GradientButton asChild className="w-64 h-12">
            <Link to="/auth">
              Start Your Free Trial
            </Link>
          </GradientButton>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="bg-white rounded p-1.5 mr-2">
                  <span className="text-black font-bold text-sm">C</span>
                </div>
                <span className="font-semibold text-xl">Chatbase</span>
              </div>
              <p className="text-gray-400">
                Building the future of AI assistants.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><Link to="/" className="text-gray-400 hover:text-white">Features</Link></li>
                <li><Link to="/pricing" className="text-gray-400 hover:text-white">Pricing</Link></li>
                <li><Link to="/affiliates" className="text-gray-400 hover:text-white">Affiliates</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><Link to="/docs" className="text-gray-400 hover:text-white">Documentation</Link></li>
                <li><Link to="/blog" className="text-gray-400 hover:text-white">Blog</Link></li>
                <li><Link to="/" className="text-gray-400 hover:text-white">Tutorials</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link to="/" className="text-gray-400 hover:text-white">About</Link></li>
                <li><Link to="/" className="text-gray-400 hover:text-white">Contact</Link></li>
                <li><Link to="/" className="text-gray-400 hover:text-white">Privacy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>© {new Date().getFullYear()} Chatbase. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Feature card component for the key features section
const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex justify-center mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-semibold text-center mb-2">{title}</h3>
    <p className="text-gray-600 text-center">{description}</p>
  </div>
);

// Step card component for the how it works section
const StepCard = ({ number, title, description }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex justify-center mb-4">
      <div className="bg-pink-100 text-pink-600 w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl">
        {number}
      </div>
    </div>
    <h3 className="text-xl font-semibold text-center mb-2">{title}</h3>
    <p className="text-gray-600 text-center">{description}</p>
  </div>
);

// Testimonial card component for the social proof section
const TestimonialCard = ({ quote, author, company }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
    <div className="mb-4 text-yellow-500 flex justify-center">
      <Star className="w-5 h-5 inline-block" />
      <Star className="w-5 h-5 inline-block" />
      <Star className="w-5 h-5 inline-block" />
      <Star className="w-5 h-5 inline-block" />
      <Star className="w-5 h-5 inline-block" />
    </div>
    <p className="text-gray-600 italic mb-4 text-center">{quote}</p>
    <div className="text-center">
      <p className="font-semibold">{author}</p>
      <p className="text-gray-500 text-sm">{company}</p>
    </div>
  </div>
);

// Pricing card component for the pricing options section
const PricingCard = ({ title, price, period, description, features, buttonText, buttonLink, highlighted }) => (
  <div className={`rounded-xl shadow-sm border ${highlighted ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-100'} bg-white overflow-hidden`}>
    <div className={`p-6 ${highlighted ? 'bg-blue-50' : ''}`}>
      <h3 className="text-xl font-semibold text-center mb-2">{title}</h3>
      <div className="text-center mb-4">
        <span className="text-4xl font-bold">{price}</span>
        <span className="text-gray-500">{period}</span>
      </div>
      <p className="text-gray-600 text-center mb-6">{description}</p>
    </div>
    <div className="p-6 border-t border-gray-100">
      <ul className="space-y-4 mb-6">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <Check className="w-5 h-5 text-green-500 mr-2 shrink-0 mt-0.5" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <GradientButton asChild className={`w-full h-10 ${highlighted ? '' : 'gradient-button-variant'}`}>
        <Link to={buttonLink}>{buttonText}</Link>
      </GradientButton>
    </div>
  </div>
);

export default Index;
