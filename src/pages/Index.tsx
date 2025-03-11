import { Link } from "react-router-dom";
import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect.tsx";
import { useAuth } from "@/context/AuthContext.tsx";
import { useIsMobile } from "@/hooks/use-mobile.tsx";
import { SplashCursor } from "@/components/ui/fluid-cursor";
import { GradientButton } from "@/components/gradient-button";
import { ChevronDown, ArrowRight, Check, Star, CreditCard, DollarSign, HandHeart, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";
import LanguageSelector from "@/components/LanguageSelector";

const Index = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [language, setLanguage] = useState<string>("pl"); // Default to Polish
  
  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferredLanguage');
    if (savedLanguage && ['en', 'pl'].includes(savedLanguage)) {
      setLanguage(savedLanguage);
    } else {
      const userLanguage = navigator.language || navigator.languages?.[0] || 'en';
      const primaryLanguage = userLanguage.split('-')[0];
      const detectedLanguage = ['pl', 'en'].includes(primaryLanguage) ? primaryLanguage : 'en';
      setLanguage(detectedLanguage);
    }
  }, []);
  
  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    localStorage.setItem('preferredLanguage', newLanguage);
  };
  
  const content = {
    en: {
      heroTitle: "The road to freedom starts from here",
      heroSubtitle: "Create, train and deploy custom chatbots without coding",
      typewriter: [
        { text: "Create" },
        { text: "amazing" },
        { text: "apps" },
        { text: "with" },
        { text: "Chatbase.", className: "text-blue-500 dark:text-blue-500" }
      ],
      startNow: "Join now",
      createAccount: "Signup",
      features: {
        title: "Key Features",
        subtitle: "Everything you need to create a powerful AI assistant for your business",
        items: [
          {
            title: "No-code Platform",
            description: "Create and deploy AI assistants without programming knowledge"
          },
          {
            title: "Custom Training",
            description: "Train your bot with your own data and knowledge base"
          },
          {
            title: "Multi-channel Integration",
            description: "Deploy to website, WhatsApp, Slack and other platforms with one click"
          }
        ]
      },
      howItWorks: {
        title: "How It Works",
        subtitle: "Create your own AI assistant in three simple steps",
        steps: [
          {
            number: "1",
            title: "Create your bot",
            description: "Sign up and create your first AI assistant using the intuitive interface"
          },
          {
            number: "2",
            title: "Train with your data",
            description: "Upload documents or connect to a knowledge base to customize responses"
          },
          {
            number: "3",
            title: "Deploy everywhere",
            description: "Integrate with your website, messaging apps or other platforms with simple embed codes"
          }
        ]
      },
      testimonials: {
        title: "What our customers say",
        subtitle: "Join thousands of satisfied customers using Chatbase"
      },
      pricing: {
        title: "Simple, transparent pricing",
        subtitle: "Choose the plan that works for your business"
      },
      cta: {
        title: "Ready to transform your customer experience?",
        subtitle: "Join thousands of businesses already using Chatbase to provide exceptional service",
        button: "Start your free trial"
      },
      guarantee: {
        title: "Our Money-Back Guarantee",
        text: "If your revenue doesn't increase within 3 months, we'll give you a full refund.",
        signature: "- Karol Sapiołko, Founder",
        note: "Seriously. Check our terms and conditions, I'm not joking."
      }
    },
    pl: {
      heroTitle: "The road to freedom starts from here",
      heroSubtitle: "Twórz, trenuj i wdrażaj niestandardowe chatboty bez kodowania",
      typewriter: [
        { text: "Twórz" },
        { text: "wspaniałe" },
        { text: "aplikacje" },
        { text: "z" },
        { text: "Chatbase.", className: "text-blue-500 dark:text-blue-500" }
      ],
      startNow: "Join now",
      createAccount: "Signup",
      features: {
        title: "Kluczowe funkcje",
        subtitle: "Wszystko czego potrzebujesz, aby stworzyć potężnego asystenta AI dla swojej firmy",
        items: [
          {
            title: "Platforma bez kodowania",
            description: "Twórz i wdrażaj asystentów AI bez znajomości programowania"
          },
          {
            title: "Niestandardowe szkolenie",
            description: "Trenuj swojego bota własnymi danymi i bazą wiedzy"
          },
          {
            title: "Integracja z wieloma kanałami",
            description: "Wdrażaj na stronę, WhatsApp, Slack i inne platformy jednym kliknięciem"
          }
        ]
      },
      howItWorks: {
        title: "Jak to działa",
        subtitle: "Stwórz własnego asystenta AI w trzech prostych krokach",
        steps: [
          {
            number: "1",
            title: "Stwórz swojego bota",
            description: "Zarejestruj się i stwórz pierwszego asystenta AI za pomocą intuicyjnego interfejsu"
          },
          {
            number: "2",
            title: "Trenuj swoimi danymi",
            description: "Wgraj dokumenty lub połącz z bazą wiedzy, aby dostosować odpowiedzi"
          },
          {
            number: "3",
            title: "Wdrażaj wszędzie",
            description: "Integruj ze stroną, aplikacjami do wiadomości lub innymi platformami dzięki prostym kodom osadzania"
          }
        ]
      },
      testimonials: {
        title: "Co mówią nasi klienci",
        subtitle: "Dołącz do tysięcy zadowolonych klientów korzystających z Chatbase"
      },
      pricing: {
        title: "Prosta, przejrzysta wycena",
        subtitle: "Wybierz plan, który działa dla Twojej firmy"
      },
      cta: {
        title: "Gotowy na transformację doświadczeń Twoich klientów?",
        subtitle: "Dołącz do tysięcy firm już korzystających z Chatbase, aby zapewnić wyjątkową obsługę",
        button: "Rozpocznij darmowy okres próbny"
      },
      guarantee: {
        title: "Nasza gwarancja zwrotu pieniędzy",
        text: "Jak nie wzrosną ci przychody przez 3 miesiące to zwrócę ci hajs.",
        signature: "- Karol Sapiołko, Właściciel",
        note: "Poważnie, sprawdź w regulaminie, nie żartuje."
      }
    }
  };

  const t = content[language as keyof typeof content];
  
  const words = t.typewriter;

  const TopNav = () => (
    <header className="fixed top-0 left-0 right-0 bg-white bg-opacity-90 backdrop-blur-sm z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <div className="bg-black rounded p-1.5 mr-2">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="font-semibold text-xl">Chatbase</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/affiliates" className="text-gray-600 hover:text-gray-900 font-medium">
              {language === 'pl' ? 'Partnerzy' : 'Affiliates'}
            </Link>
            <Link to="/pricing" className="text-gray-600 hover:text-gray-900 font-medium">
              {language === 'pl' ? 'Cennik' : 'Pricing'}
            </Link>
            <div className="relative group">
              <button className="flex items-center text-gray-600 hover:text-gray-900 font-medium">
                {language === 'pl' ? 'Zasoby' : 'Resources'}
                <ChevronDown size={16} className="ml-1" />
              </button>
              <div className="absolute left-0 mt-2 w-48 bg-white shadow-lg rounded-md py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <Link to="/docs" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  {language === 'pl' ? 'Dokumentacja' : 'Documentation'}
                </Link>
                <Link to="/blog" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Blog
                </Link>
                <Link to="/tutorials" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  {language === 'pl' ? 'Poradniki' : 'Tutorials'}
                </Link>
              </div>
            </div>
            <LanguageSelector 
              currentLanguage={language}
              onLanguageChange={handleLanguageChange}
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="md:hidden">
              <LanguageSelector 
                currentLanguage={language}
                onLanguageChange={handleLanguageChange}
                variant="minimal"
              />
            </div>
            <GradientButton asChild className="w-32 h-10">
              <Link to={user ? "/dashboard" : "/auth"}>
                {language === 'pl' ? 'Panel' : 'Dashboard'}
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
      
      <section className="pt-24 px-4 sm:px-6 lg:px-8 flex items-center justify-center min-h-[70vh]">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col items-center justify-center text-center">
            <p className="text-neutral-600 dark:text-neutral-200 text-lg mb-4">
              {t.heroTitle}
            </p>
            
            <TypewriterEffectSmooth 
              words={[]} 
              className="mb-8" 
              cursorClassName="text-blue-500" 
            />
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/auth">
                <button className="px-8 py-3 bg-black text-white font-medium rounded-md">
                  {t.startNow}
                </button>
              </Link>
              <Link to="/auth" state={{ isSignUp: true }}>
                <button className="px-8 py-3 bg-white text-black font-medium rounded-md border border-gray-300">
                  {t.createAccount}
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{t.features.title}</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t.features.subtitle}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {t.features.items.map((feature, index) => (
              <FeatureCard 
                key={index}
                icon={index === 0 
                  ? <Check className="w-8 h-8 text-green-500" />
                  : index === 1 
                    ? <Star className="w-8 h-8 text-yellow-500" />
                    : <ArrowRight className="w-8 h-8 text-blue-500" />
                }
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-pink-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{t.howItWorks.title}</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t.howItWorks.subtitle}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {t.howItWorks.steps.map((step, index) => (
              <StepCard 
                key={index}
                number={step.number}
                title={step.title}
                description={step.description}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{t.testimonials.title}</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t.testimonials.subtitle}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TestimonialCard 
              quote={language === 'pl'
                ? "Chatbase pomógł nam zredukować koszty obsługi klienta o 40% przy jednoczesnej poprawie czasu odpowiedzi."
                : "Chatbase helped us reduce customer service costs by 40% while improving response times."
              }
              author={language === 'pl' ? "Katarzyna Nowak" : "Katherine Smith"}
              company={language === 'pl' ? "Tech Solutions Polska" : "Tech Solutions"} 
            />
            <TestimonialCard 
              quote={language === 'pl'
                ? "Skonfigurowanie naszego asystenta AI zajęło mniej niż godzinę. Zwrot z inwestycji był niesamowity."
                : "Setting up our AI assistant took less than an hour. The ROI has been amazing."
              }
              author={language === 'pl' ? "Michał Kowalski" : "Michael Brown"}
              company={language === 'pl' ? "Growth Marketing" : "Growth Marketing"} 
            />
            <TestimonialCard 
              quote={language === 'pl'
                ? "Nasi klienci uwielbiają otrzymywać natychmiastowe odpowiedzi 24/7. To zmieniło zasady gry dla naszego biznesu."
                : "Our customers love getting instant answers 24/7. It's been a game-changer for our business."
              }
              author={language === 'pl' ? "Anna Wiśniewska" : "Anna Wilson"}
              company={language === 'pl' ? "Sklep E-commerce" : "E-commerce Store"} 
            />
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{t.pricing.title}</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t.pricing.subtitle}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <PricingCard 
              title="Starter"
              price={language === 'pl' ? "99 zł" : "$29"}
              period={language === 'pl' ? "/miesiąc" : "/month"}
              description={language === 'pl' 
                ? "Idealny dla małych firm rozpoczynających działalność"
                : "Perfect for small businesses just getting started"
              }
              features={language === 'pl'
                ? [
                    "1 Asystent AI",
                    "1000 wiadomości/miesiąc",
                    "Standardowy czas odpowiedzi",
                    "Wsparcie e-mail"
                  ]
                : [
                    "1 AI Assistant",
                    "1000 messages/month",
                    "Standard response time",
                    "Email support"
                  ]
              }
              buttonText={language === 'pl' ? "Rozpocznij" : "Start"}
              buttonLink="/auth"
              highlighted={false}
            />
            <PricingCard 
              title={language === 'pl' ? "Profesjonalny" : "Professional"}
              price={language === 'pl' ? "299 zł" : "$89"}
              period={language === 'pl' ? "/miesiąc" : "/month"}
              description={language === 'pl'
                ? "Idealny dla rozwijających się firm o większych potrzebach"
                : "Ideal for growing companies with more needs"
              }
              features={language === 'pl'
                ? [
                    "3 Asystenty AI",
                    "10 000 wiadomości/miesiąc",
                    "Szybki czas odpowiedzi",
                    "Priorytetowe wsparcie",
                    "Niestandardowy branding"
                  ]
                : [
                    "3 AI Assistants",
                    "10,000 messages/month",
                    "Fast response time",
                    "Priority support",
                    "Custom branding"
                  ]
              }
              buttonText={language === 'pl' ? "Rozpocznij" : "Start"}
              buttonLink="/auth"
              highlighted={true}
            />
            <PricingCard 
              title="Enterprise"
              price={language === 'pl' ? "799 zł" : "$249"}
              period={language === 'pl' ? "/miesiąc" : "/month"}
              description={language === 'pl'
                ? "Dla firm o zaawansowanych wymaganiach"
                : "For businesses with advanced requirements"
              }
              features={language === 'pl'
                ? [
                    "Nieograniczona liczba Asystentów AI",
                    "50 000 wiadomości/miesiąc",
                    "Najszybszy czas odpowiedzi",
                    "Wsparcie 24/7",
                    "Niestandardowe integracje",
                    "Zaawansowana analityka"
                  ]
                : [
                    "Unlimited AI Assistants",
                    "50,000 messages/month",
                    "Fastest response time",
                    "24/7 support",
                    "Custom integrations",
                    "Advanced analytics"
                  ]
              }
              buttonText={language === 'pl' ? "Kontakt z działem sprzedaży" : "Contact sales"}
              buttonLink="/auth"
              highlighted={false}
            />
          </div>
        </div>
      </section>

      {/* Guarantee Section - Added as requested */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-green-100 p-3 rounded-full">
              <ShieldCheck className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-4">{t.guarantee.title}</h2>
          <p className="text-xl mb-2 font-semibold">{t.guarantee.text}</p>
          <p className="text-gray-700 italic mb-2">{t.guarantee.signature}</p>
          <p className="text-sm text-gray-500">{t.guarantee.note}</p>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-pink-100 to-pink-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">{t.cta.title}</h2>
          <p className="text-lg text-gray-600 mb-8">
            {t.cta.subtitle}
          </p>
          <GradientButton asChild className="w-64 h-12">
            <Link to="/auth">
              {t.cta.button}
            </Link>
          </GradientButton>
        </div>
      </section>

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
                {language === 'pl'
                  ? "Budujemy przyszłość asystentów AI."
                  : "Building the future of AI assistants."
                }
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">{language === 'pl' ? "Produkt" : "Product"}</h3>
              <ul className="space-y-2">
                <li><Link to="/" className="text-gray-400 hover:text-white">{language === 'pl' ? "Funkcje" : "Features"}</Link></li>
                <li><Link to="/pricing" className="text-gray-400 hover:text-white">{language === 'pl' ? "Cennik" : "Pricing"}</Link></li>
                <li><Link to="/affiliates" className="text-gray-400 hover:text-white">{language === 'pl' ? "Partnerzy" : "Affiliates"}</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">{language === 'pl' ? "Zasoby" : "Resources"}</h3>
              <ul className="space-y-2">
                <li><Link to="/docs" className="text-gray-400 hover:text-white">{language === 'pl' ? "Dokumentacja" : "Documentation"}</Link></li>
                <li><Link to="/blog" className="text-gray-400 hover:text-white">Blog</Link></li>
                <li><Link to="/" className="text-gray-400 hover:text-white">{language === 'pl' ? "Poradniki" : "Tutorials"}</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">{language === 'pl' ? "Firma" : "Company"}</h3>
              <ul className="space-y-2">
                <li><Link to="/" className="text-gray-400 hover:text-white">{language === 'pl' ? "O nas" : "About us"}</Link></li>
                <li><Link to="/" className="text-gray-400 hover:text-white">{language === 'pl' ? "Kontakt" : "Contact"}</Link></li>
                <li><Link to="/" className="text-gray-400 hover:text-white">{language === 'pl' ? "Prywatność" : "Privacy"}</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>© {new Date().getFullYear()} Chatbase. {language === 'pl' ? "Wszelkie prawa zastrzeżone." : "All rights reserved."}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex justify-center mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-semibold text-center mb-2">{title}</h3>
    <p className="text-gray-600 text-center">{description}</p>
  </div>
);

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
