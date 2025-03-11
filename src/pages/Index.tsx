
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
      text: "Twórz",
    },
    {
      text: "wspaniałe",
    },
    {
      text: "aplikacje",
    },
    {
      text: "z",
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
              Partnerzy
            </Link>
            <Link to="/pricing" className="text-gray-600 hover:text-gray-900 font-medium">
              Cennik
            </Link>
            <div className="relative group">
              <button className="flex items-center text-gray-600 hover:text-gray-900 font-medium">
                Zasoby
                <ChevronDown size={16} className="ml-1" />
              </button>
              <div className="absolute left-0 mt-2 w-48 bg-white shadow-lg rounded-md py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <Link to="/docs" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Dokumentacja
                </Link>
                <Link to="/blog" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Blog
                </Link>
                <Link to="/tutorials" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Poradniki
                </Link>
              </div>
            </div>
          </div>
          
          {/* Dashboard Button */}
          <div>
            <GradientButton asChild className="w-32 h-10">
              <Link to={user ? "/dashboard" : "/auth"}>
                {user ? "Panel" : "Panel"}
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
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Stwórz swojego asystenta AI w kilka minut</h1>
            <p className="text-neutral-600 dark:text-neutral-200 text-lg mb-6 max-w-2xl mx-auto">
              Twórz, trenuj i wdrażaj niestandardowe chatboty bez kodowania
            </p>
            <TypewriterEffectSmooth words={words} className="mb-8" />
            <div className="flex flex-col sm:flex-row gap-4">
              <GradientButton asChild className="w-full sm:w-auto h-12">
                <Link to="/auth">
                  Zacznij teraz
                </Link>
              </GradientButton>
              <GradientButton asChild variant="variant" className="w-full sm:w-auto h-12">
                <Link to="/auth" state={{ isSignUp: true }}>
                  Załóż darmowe konto
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
            <h2 className="text-3xl font-bold mb-4">Kluczowe funkcje</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Wszystko czego potrzebujesz, aby stworzyć potężnego asystenta AI dla swojej firmy
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Check className="w-8 h-8 text-green-500" />}
              title="Platforma bez kodowania"
              description="Twórz i wdrażaj asystentów AI bez znajomości programowania"
            />
            <FeatureCard 
              icon={<Star className="w-8 h-8 text-yellow-500" />}
              title="Niestandardowe szkolenie"
              description="Trenuj swojego bota własnymi danymi i bazą wiedzy"
            />
            <FeatureCard 
              icon={<ArrowRight className="w-8 h-8 text-blue-500" />}
              title="Integracja z wieloma kanałami"
              description="Wdrażaj na stronę, WhatsApp, Slack i inne platformy jednym kliknięciem"
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-pink-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Jak to działa</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Stwórz własnego asystenta AI w trzech prostych krokach
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StepCard 
              number="1"
              title="Stwórz swojego bota"
              description="Zarejestruj się i stwórz pierwszego asystenta AI za pomocą intuicyjnego interfejsu"
            />
            <StepCard 
              number="2"
              title="Trenuj swoimi danymi"
              description="Wgraj dokumenty lub połącz z bazą wiedzy, aby dostosować odpowiedzi"
            />
            <StepCard 
              number="3"
              title="Wdrażaj wszędzie"
              description="Integruj ze stroną, aplikacjami do wiadomości lub innymi platformami dzięki prostym kodom osadzania"
            />
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Co mówią nasi klienci</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Dołącz do tysięcy zadowolonych klientów korzystających z Chatbase
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TestimonialCard 
              quote="Chatbase pomógł nam zredukować koszty obsługi klienta o 40% przy jednoczesnej poprawie czasu odpowiedzi."
              author="Katarzyna Nowak"
              company="Tech Solutions Polska"
            />
            <TestimonialCard 
              quote="Skonfigurowanie naszego asystenta AI zajęło mniej niż godzinę. Zwrot z inwestycji był niesamowity."
              author="Michał Kowalski"
              company="Growth Marketing"
            />
            <TestimonialCard 
              quote="Nasi klienci uwielbiają otrzymywać natychmiastowe odpowiedzi 24/7. To zmieniło zasady gry dla naszego biznesu."
              author="Anna Wiśniewska"
              company="Sklep E-commerce"
            />
          </div>
        </div>
      </section>

      {/* Pricing Options Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Prosta, przejrzysta wycena</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Wybierz plan, który działa dla Twojej firmy
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <PricingCard 
              title="Starter"
              price="99 zł"
              period="/miesiąc"
              description="Idealny dla małych firm rozpoczynających działalność"
              features={[
                "1 Asystent AI",
                "1000 wiadomości/miesiąc",
                "Standardowy czas odpowiedzi",
                "Wsparcie e-mail"
              ]}
              buttonText="Rozpocznij"
              buttonLink="/auth"
              highlighted={false}
            />
            <PricingCard 
              title="Profesjonalny"
              price="299 zł"
              period="/miesiąc"
              description="Idealny dla rozwijających się firm o większych potrzebach"
              features={[
                "3 Asystenty AI",
                "10 000 wiadomości/miesiąc",
                "Szybki czas odpowiedzi",
                "Priorytetowe wsparcie",
                "Niestandardowy branding"
              ]}
              buttonText="Rozpocznij"
              buttonLink="/auth"
              highlighted={true}
            />
            <PricingCard 
              title="Enterprise"
              price="799 zł"
              period="/miesiąc"
              description="Dla firm o zaawansowanych wymaganiach"
              features={[
                "Nieograniczona liczba Asystentów AI",
                "50 000 wiadomości/miesiąc",
                "Najszybszy czas odpowiedzi",
                "Wsparcie 24/7",
                "Niestandardowe integracje",
                "Zaawansowana analityka"
              ]}
              buttonText="Kontakt z działem sprzedaży"
              buttonLink="/auth"
              highlighted={false}
            />
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-pink-100 to-pink-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Gotowy na transformację doświadczeń Twoich klientów?</h2>
          <p className="text-lg text-gray-600 mb-8">
            Dołącz do tysięcy firm już korzystających z Chatbase, aby zapewnić wyjątkową obsługę
          </p>
          <GradientButton asChild className="w-64 h-12">
            <Link to="/auth">
              Rozpocznij darmowy okres próbny
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
                Budujemy przyszłość asystentów AI.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Produkt</h3>
              <ul className="space-y-2">
                <li><Link to="/" className="text-gray-400 hover:text-white">Funkcje</Link></li>
                <li><Link to="/pricing" className="text-gray-400 hover:text-white">Cennik</Link></li>
                <li><Link to="/affiliates" className="text-gray-400 hover:text-white">Partnerzy</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Zasoby</h3>
              <ul className="space-y-2">
                <li><Link to="/docs" className="text-gray-400 hover:text-white">Dokumentacja</Link></li>
                <li><Link to="/blog" className="text-gray-400 hover:text-white">Blog</Link></li>
                <li><Link to="/" className="text-gray-400 hover:text-white">Poradniki</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Firma</h3>
              <ul className="space-y-2">
                <li><Link to="/" className="text-gray-400 hover:text-white">O nas</Link></li>
                <li><Link to="/" className="text-gray-400 hover:text-white">Kontakt</Link></li>
                <li><Link to="/" className="text-gray-400 hover:text-white">Prywatność</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>© {new Date().getFullYear()} Chatbase. Wszelkie prawa zastrzeżone.</p>
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
