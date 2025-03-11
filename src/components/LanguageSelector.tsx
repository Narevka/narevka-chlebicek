
import React from "react";
import { Globe } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface LanguageSelectorProps {
  currentLanguage: string;
  onLanguageChange: (language: string) => void;
  variant?: "default" | "minimal";
}

const LanguageSelector = ({
  currentLanguage,
  onLanguageChange,
  variant = "default"
}: LanguageSelectorProps) => {
  const handleLanguageChange = (value: string) => {
    onLanguageChange(value);
    
    // Show toast notification based on selected language
    if (value === "pl") {
      toast.success("Zmieniono język na polski");
    } else {
      toast.success("Language changed to English");
    }
  };

  return (
    <div className="flex items-center">
      {variant === "default" && (
        <Globe className="mr-2 h-4 w-4 text-gray-500" />
      )}
      <Select value={currentLanguage} onValueChange={handleLanguageChange}>
        <SelectTrigger 
          className={
            variant === "minimal" 
              ? "border-none bg-transparent h-8 w-16 px-1" 
              : "w-[120px]"
          }
        >
          <SelectValue placeholder="Language" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="en">English</SelectItem>
          <SelectItem value="pl">Polski</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default LanguageSelector;
