
"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export interface TypewriterEffectSmoothProps {
  words: {
    text: string;
    className?: string;
  }[];
  className?: string;
  cursorClassName?: string;
}

export const TypewriterEffectSmooth = ({
  words,
  className,
  cursorClassName,
}: TypewriterEffectSmoothProps) => {
  // Track the current text being displayed
  const [displayText, setDisplayText] = useState("");
  
  // Define the full text to be typed
  const fullText = "Build awesome apps with Aceternity.";
  
  // Typing speed in milliseconds
  const typingSpeed = 100;

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    // If we haven't completed typing the full text
    if (displayText.length < fullText.length) {
      // Add next character
      timeout = setTimeout(() => {
        setDisplayText(fullText.slice(0, displayText.length + 1));
      }, typingSpeed);
    }
    
    return () => clearTimeout(timeout);
  }, [displayText, fullText]);

  // Function to render the text with proper styling
  const renderText = () => {
    // Split the text into parts to style differently
    const parts = displayText.split("with ");
    
    if (parts.length === 1) {
      // If "with" is not in the text yet
      return <span>{displayText}</span>;
    } else {
      return (
        <>
          <span>{parts[0]}with </span>
          <span className="text-blue-500">{parts[1]}</span>
        </>
      );
    }
  };

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <div className="text-center">
        <h1 className="text-4xl font-bold leading-tight sm:text-5xl md:text-6xl lg:text-7xl whitespace-nowrap">
          {renderText()}
          <span className={cn("animate-pulse", cursorClassName)}>|</span>
        </h1>
      </div>
    </div>
  );
};
