
import React from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { LucideIcon } from "lucide-react";

interface ActionTooltipButtonProps {
  onClick: () => void;
  icon: LucideIcon;
  tooltip: string;
  disabled?: boolean;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  className?: string;
}

const ActionTooltipButton: React.FC<ActionTooltipButtonProps> = ({
  onClick,
  icon: Icon,
  tooltip,
  disabled = false,
  variant = "outline",
  className
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant={variant} 
            size="sm" 
            onClick={onClick}
            disabled={disabled}
            className={className}
          >
            <Icon className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ActionTooltipButton;
