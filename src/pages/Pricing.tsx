
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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
        <div className="flex justify-center items-center space-x-4 mb-8">
          <span className={cn("text-sm font-medium", billingCycle === "monthly" ? "text-gray-900" : "text-gray-500")}>
            Monthly Billing
          </span>
          <button 
            onClick={toggleBilling}
            className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200"
          >
            <span className="sr-only">Toggle billing cycle</span>
            <span 
              className={cn(
                "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                billingCycle === "annual" ? "translate-x-6" : "translate-x-1"
              )}
            />
          </button>
          <span className={cn("text-sm font-medium flex items-center", billingCycle === "annual" ? "text-gray-900" : "text-gray-500")}>
            Annual Billing
            {billingCycle === "annual" && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                25% Discount
              </span>
            )}
          </span>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          {/* Free Plan */}
          <Card className="border border-gray-200 shadow-sm rounded-2xl overflow-hidden bg-white">
            <CardHeader className="pt-6 px-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gray-100">
                  <img src="/lovable-uploads/0487f87e-5421-475b-92c4-0f67f771578c.png" alt="Free plan" className="w-10 h-10 object-contain" />
                </div>
                <CardTitle className="text-xl font-semibold">Free</CardTitle>
              </div>
              <CardDescription className="mt-3 text-sm text-gray-600">
                Unleash the power of AI documentation.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 px-6">
              <div className="mt-2 mb-6">
                <p className="text-3xl font-bold">
                  ${getPrice(0, 0)}
                  <span className="text-sm font-normal text-gray-500">/month</span>
                </p>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0 mr-2" />
                  <span className="text-sm text-gray-600">Feature 1</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0 mr-2" />
                  <span className="text-sm text-gray-600">Feature 2</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0 mr-2" />
                  <span className="text-sm text-gray-600">Feature 3</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="px-6 pt-4 pb-8">
              <Button variant="outline" className="w-full">
                Get started for free
              </Button>
            </CardFooter>
          </Card>

          {/* Professional Plan */}
          <Card className="border-0 shadow-lg rounded-2xl overflow-hidden bg-blue-500 text-white transform scale-105 relative z-10">
            <div className="absolute -top-3 inset-x-0 flex justify-center">
              <div className="bg-blue-600 text-white text-xs font-medium px-3 py-1 rounded-full uppercase tracking-wide">
                Most Popular
              </div>
            </div>
            <CardHeader className="pt-8 px-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-blue-400 bg-opacity-30">
                  <img src="/lovable-uploads/0487f87e-5421-475b-92c4-0f67f771578c.png" alt="Professional plan" className="w-10 h-10 object-contain" />
                </div>
                <CardTitle className="text-xl font-semibold text-white">Professional</CardTitle>
              </div>
              <CardDescription className="mt-3 text-sm text-blue-100">
                Scale your business and team with enterprise-grade features
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 px-6">
              <div className="mt-2 mb-6">
                <p className="text-3xl font-bold text-white">
                  ${getPrice(49, 37)}
                  <span className="text-sm font-normal text-blue-200">/month</span>
                </p>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-blue-200 flex-shrink-0 mr-2" />
                  <span className="text-sm text-blue-100">All in the Free plan</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-blue-200 flex-shrink-0 mr-2" />
                  <span className="text-sm text-blue-100">Feature 4</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-blue-200 flex-shrink-0 mr-2" />
                  <span className="text-sm text-blue-100">Feature 5</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-blue-200 flex-shrink-0 mr-2" />
                  <span className="text-sm text-blue-100">Feature 6</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-blue-200 flex-shrink-0 mr-2" />
                  <span className="text-sm text-blue-100">Feature 7</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="px-6 pt-4 pb-8">
              <Button className="w-full bg-white text-blue-600 hover:bg-blue-50">
                Get started
              </Button>
            </CardFooter>
          </Card>

          {/* Company Plan */}
          <Card className="border border-gray-200 shadow-sm rounded-2xl overflow-hidden bg-white">
            <CardHeader className="pt-6 px-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gray-100">
                  <img src="/lovable-uploads/0487f87e-5421-475b-92c4-0f67f771578c.png" alt="Company plan" className="w-10 h-10 object-contain" />
                </div>
                <CardTitle className="text-xl font-semibold">Company</CardTitle>
              </div>
              <CardDescription className="mt-3 text-sm text-gray-600">
                Unleash the power of AI documentation.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 px-6">
              <div className="mt-2 mb-6">
                <p className="text-3xl font-bold">
                  Let's chat!
                </p>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0 mr-2" />
                  <span className="text-sm text-gray-600">Unlimited active projects</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0 mr-2" />
                  <span className="text-sm text-gray-600">Unlimited documents</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0 mr-2" />
                  <span className="text-sm text-gray-600">Unlimited users</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="px-6 pt-4 pb-8">
              <Button variant="outline" className="w-full">
                Request Demo
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Additional Benefits Section */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-center mb-10">Only the most important benefits</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold mb-3">AI-Powered Documentation</h3>
              <p className="text-gray-600">Automatically generate and organize documentation using our advanced AI technology.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold mb-3">Seamless Integration</h3>
              <p className="text-gray-600">Connect with your existing tools and workflows with our flexible API and integrations.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold mb-3">Team Collaboration</h3>
              <p className="text-gray-600">Work together effectively with real-time updates and shared workspaces.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold mb-3">Advanced Analytics</h3>
              <p className="text-gray-600">Gain insights into usage patterns and performance metrics to optimize your workflow.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold mb-3">Custom Branding</h3>
              <p className="text-gray-600">Personalize your documentation with your company's logo, colors, and styling.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold mb-3">Priority Support</h3>
              <p className="text-gray-600">Get faster responses and dedicated assistance with our priority support channels.</p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-center mb-10">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold mb-3">Can I upgrade or downgrade my plan later?</h3>
              <p className="text-gray-600">Yes, you can change your plan at any time. Changes will be prorated based on the remaining time in your billing cycle.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold mb-3">Do you offer a free trial?</h3>
              <p className="text-gray-600">Yes, you can try our Professional plan free for 14 days, no credit card required.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold mb-3">How does billing work?</h3>
              <p className="text-gray-600">You'll be billed at the start of each billing cycle (monthly or annually). We accept all major credit cards.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold mb-3">Is there a setup fee?</h3>
              <p className="text-gray-600">No, there are no setup fees for any of our plans. You only pay the displayed subscription price.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
