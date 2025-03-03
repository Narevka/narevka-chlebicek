
import { useState } from "react";
import { Link } from "react-router-dom";
import BillingToggle from "@/components/pricing/BillingToggle";
import PricingCard from "@/components/pricing/PricingCard";
import BenefitsSection from "@/components/pricing/BenefitsSection";
import FaqSection from "@/components/pricing/FaqSection";

const Pricing = () => {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");

  const toggleBilling = () => {
    setBillingCycle(billingCycle === "monthly" ? "annual" : "monthly");
  };

  const getPrice = (monthly: number, annual: number) => {
    return billingCycle === "monthly" ? monthly : annual;
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold sm:text-5xl sm:tracking-tight lg:text-6xl">
            <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 text-transparent bg-clip-text">
              Pricing Cards
            </span>
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
            Ultimate Cheat Sheet
          </p>
        </div>

        {/* Billing Toggle */}
        <BillingToggle billingCycle={billingCycle} toggleBilling={toggleBilling} />

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          {/* Free Plan */}
          <PricingCard
            title="Free"
            description="Unleash the power of AI documentation."
            price={getPrice(0, 0)}
            isPriceMonthly={true}
            features={["Feature 1", "Feature 2", "Feature 3"]}
            buttonText="Get started for free"
            buttonVariant="outline"
            iconSrc="/lovable-uploads/0487f87e-5421-475b-92c4-0f67f771578c.png"
          />

          {/* Professional Plan */}
          <PricingCard
            title="Professional"
            description="Scale your business and team with enterprise-grade features"
            price={getPrice(49, 37)}
            isPriceMonthly={true}
            features={[
              "All in the Free plan",
              "Feature 4",
              "Feature 5",
              "Feature 6",
              "Feature 7"
            ]}
            isPopular={true}
            buttonText="Get started"
            iconSrc="/lovable-uploads/0487f87e-5421-475b-92c4-0f67f771578c.png"
          />

          {/* Company Plan */}
          <PricingCard
            title="Company"
            description="Unleash the power of AI documentation."
            price="Let's chat!"
            isPriceMonthly={false}
            features={[
              "Unlimited active projects",
              "Unlimited documents",
              "Unlimited users"
            ]}
            buttonText="Request Demo"
            buttonVariant="outline"
            iconSrc="/lovable-uploads/0487f87e-5421-475b-92c4-0f67f771578c.png"
          />
        </div>

        {/* Benefits Section */}
        <BenefitsSection />

        {/* FAQ Section */}
        <FaqSection />
      </div>
    </div>
  );
};

export default Pricing;
