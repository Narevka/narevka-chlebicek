
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface PricingCardProps {
  title: string;
  description: string;
  price: number | string;
  isPriceMonthly?: boolean;
  features: string[];
  isPopular?: boolean;
  buttonText: string;
  buttonVariant?: "default" | "outline";
  iconSrc: string;
}

const PricingCard = ({ 
  title, 
  description, 
  price, 
  isPriceMonthly = true, 
  features, 
  isPopular = false, 
  buttonText, 
  buttonVariant = "default",
  iconSrc
}: PricingCardProps) => {
  return (
    <Card className={cn(
      "border rounded-2xl overflow-hidden relative",
      isPopular 
        ? "border-0 shadow-lg bg-blue-500 text-white transform scale-105 z-10" 
        : "border-gray-200 shadow-sm bg-white"
    )}>
      {isPopular && (
        <div className="absolute -top-3 inset-x-0 flex justify-center">
          <div className="bg-blue-600 text-white text-xs font-medium px-3 py-1 rounded-full uppercase tracking-wide">
            Most Popular
          </div>
        </div>
      )}
      <CardHeader className={cn("pt-6 px-6", isPopular && "pt-8")}>
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-12 h-12 rounded-lg flex items-center justify-center",
            isPopular ? "bg-blue-400 bg-opacity-30" : "bg-gray-100"
          )}>
            <img src={iconSrc} alt={`${title} plan`} className="w-10 h-10 object-contain" />
          </div>
          <CardTitle className={cn("text-xl font-semibold", isPopular && "text-white")}>{title}</CardTitle>
        </div>
        <CardDescription className={cn("mt-3 text-sm", isPopular ? "text-blue-100" : "text-gray-600")}>
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4 px-6">
        <div className="mt-2 mb-6">
          {typeof price === 'number' ? (
            <p className={cn("text-3xl font-bold", isPopular && "text-white")}>
              ${price}
              <span className={cn("text-sm font-normal", isPopular ? "text-blue-200" : "text-gray-500")}>/month</span>
            </p>
          ) : (
            <p className={cn("text-3xl font-bold", isPopular && "text-white")}>
              {price}
            </p>
          )}
        </div>
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <Check className={cn("h-5 w-5 flex-shrink-0 mr-2", isPopular ? "text-blue-200" : "text-green-500")} />
              <span className={cn("text-sm", isPopular ? "text-blue-100" : "text-gray-600")}>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="px-6 pt-4 pb-8">
        <Button 
          variant={isPopular ? "default" : "outline"} 
          className={cn("w-full", isPopular && "bg-white text-blue-600 hover:bg-blue-50")}
        >
          {buttonText}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PricingCard;
