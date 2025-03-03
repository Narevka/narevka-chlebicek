
import { cn } from "@/lib/utils";

interface BillingToggleProps {
  billingCycle: "monthly" | "annual";
  toggleBilling: () => void;
}

const BillingToggle = ({ billingCycle, toggleBilling }: BillingToggleProps) => {
  return (
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
  );
};

export default BillingToggle;
