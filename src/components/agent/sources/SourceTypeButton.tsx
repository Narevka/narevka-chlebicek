
import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SourceTypeButtonProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

const SourceTypeButton = ({ icon, label, active, onClick }: SourceTypeButtonProps) => {
  return (
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start py-2 px-3 text-sm font-medium",
        active
          ? "bg-purple-100 text-purple-800"
          : "text-gray-700 hover:bg-gray-100"
      )}
      onClick={onClick}
    >
      <span className={cn("mr-3", active ? "text-purple-800" : "text-gray-500")}>
        {icon}
      </span>
      {label}
    </Button>
  );
};

export default SourceTypeButton;
