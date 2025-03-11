
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext.tsx";
import { SplashCursor } from "@/components/ui/fluid-cursor";
import { GradientButton } from "@/components/gradient-button";
import { ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import LanguageSelector from "@/components/LanguageSelector";

const Terms = () => {
  const { user } = useAuth();
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
      title: "Terms and Conditions",
      subtitle: "Last updated: August 2023",
      moneyBack: {
        title: "Money-Back Guarantee",
        text: "We offer a 100% money-back guarantee if your business revenue doesn't increase by at least 10% within 3 months of using our platform at full capacity. To qualify for this guarantee:",
        conditions: [
          "You must use all available features of your plan",
          "Your AI assistant must be active on your website for at least 80% of the time",
          "You must provide evidence of your revenue before and after using our platform",
          "Request for refund must be submitted within 14 days after the 3-month period"
        ],
        contact: "To request a refund under this guarantee, please contact our support team with the necessary documentation."
      },
      sections: [
        {
          title: "1. Introduction",
          content: "Welcome to Chatbase. These Terms and Conditions govern your use of our website and services. By accessing or using Chatbase, you agree to be bound by these Terms."
        },
        {
          title: "2. Usage License",
          content: "Subject to these Terms, we grant you a limited, non-exclusive, non-transferable license to use our services for your business purposes."
        },
        {
          title: "3. User Responsibilities",
          content: "You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account."
        }
      ]
    },
    pl: {
      title: "Regulamin",
      subtitle: "Ostatnia aktualizacja: Sierpień 2023",
      moneyBack: {
        title: "Gwarancja Zwrotu Pieniędzy",
        text: "Oferujemy 100% gwarancję zwrotu pieniędzy, jeśli przychody Twojej firmy nie wzrosną o co najmniej 10% w ciągu 3 miesięcy korzystania z naszej platformy w pełnej wydajności. Aby kwalifikować się do tej gwarancji:",
        conditions: [
          "Musisz korzystać ze wszystkich dostępnych funkcji Twojego planu",
          "Twój asystent AI musi być aktywny na Twojej stronie internetowej przez co najmniej 80% czasu",
          "Musisz dostarczyć dowody na swoje przychody przed i po korzystaniu z naszej platformy",
          "Wniosek o zwrot musi być złożony w ciągu 14 dni po 3-miesięcznym okresie"
        ],
        contact: "Aby zażądać zwrotu w ramach tej gwarancji, skontaktuj się z naszym zespołem wsparcia z niezbędną dokumentacją."
      },
      sections: [
        {
          title: "1. Wprowadzenie",
          content: "Witamy w Chatbase. Niniejszy Regulamin określa zasady korzystania z naszej strony internetowej i usług. Korzystając z Chatbase, zgadzasz się przestrzegać niniejszego Regulaminu."
        },
        {
          title: "2. Licencja Użytkowania",
          content: "Na mocy niniejszego Regulaminu udzielamy ci ograniczonej, niewyłącznej, nieprzenoszalnej licencji na korzystanie z naszych usług do celów biznesowych."
        },
        {
          title: "3. Obowiązki Użytkownika",
          content: "Jesteś odpowiedzialny za zachowanie poufności informacji o swoim koncie oraz za wszystkie działania, które odbywają się w ramach Twojego konta."
        }
      ]
    }
  };

  const t = content[language as keyof typeof content];

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
      
      <div className="flex-grow pt-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold mb-2">{t.title}</h1>
            <p className="text-gray-500">{t.subtitle}</p>
          </div>
          
          <div className="bg-green-50 p-6 rounded-lg mb-10">
            <h2 className="text-xl font-semibold mb-4">{t.moneyBack.title}</h2>
            <p className="mb-4">{t.moneyBack.text}</p>
            <ul className="list-disc pl-5 mb-4 space-y-2">
              {t.moneyBack.conditions.map((condition, index) => (
                <li key={index}>{condition}</li>
              ))}
            </ul>
            <p>{t.moneyBack.contact}</p>
          </div>
          
          {t.sections.map((section, index) => (
            <div key={index} className="mb-8">
              <h2 className="text-xl font-semibold mb-3">{section.title}</h2>
              <p className="text-gray-700">{section.content}</p>
            </div>
          ))}
        </div>
      </div>
      
      <footer className="py-8 px-4 sm:px-6 lg:px-8 bg-gray-100">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-500">© {new Date().getFullYear()} Chatbase. {language === 'pl' ? "Wszelkie prawa zastrzeżone." : "All rights reserved."}</p>
        </div>
      </footer>
    </div>
  );
};

export default Terms;
