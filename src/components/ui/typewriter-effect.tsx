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
  // Track the current step of animation and text content
  const [currentStep, setCurrentStep] = useState(0);
  const [currentText, setCurrentText] = useState("");

  // Function to determine what to render based on the current step
  const getTextForStep = (step: number) => {
    if (step === 0) return "Buil";
    if (step === 1) return "Build awesome apps with Ace";
    if (step === 2) return "Build awesome apps with Aceternity.";
    return "";
  };

  // Determine which words to show based on the step
  const getWordsToShow = (step: number) => {
    const parts = getTextForStep(step).split(" ");
    return parts.map((part, index) => {
      let className = "";
      
      // Make "Ace" or "Aceternity" blue in steps 1 and 2
      if (step >= 1 && index === parts.length - 1) {
        className = "text-blue-500";
      }
      
      return {
        text: part,
        className
      };
    });
  };

  // Advance to next step every 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentStep((prev) => (prev + 1) % 3); // Cycle through 3 states
    }, 2000);

    return () => clearTimeout(timer);
  }, [currentStep]);

  // Update displayed text when step changes
  useEffect(() => {
    setCurrentText(getTextForStep(currentStep));
  }, [currentStep]);

  // Render the current state of the typewriter
  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <div className="text-center">
        <h1 className="text-4xl font-bold leading-tight sm:text-5xl md:text-6xl lg:text-7xl">
          {currentStep === 0 ? (
            // First frame - just "Buil" with a cursor
            <>
              <span>{currentText}</span>
              <span className={cn("animate-pulse", cursorClassName)}>|</span>
            </>
          ) : (
            // Other frames - full text with words
            <>
              {getWordsToShow(currentStep).map((word, idx) => (
                <span 
                  key={idx} 
                  className={word.className}
                >
                  {idx > 0 ? " " : ""}{word.text}
                </span>
              ))}
              <span className={cn("animate-pulse", cursorClassName)}>|</span>
            </>
          )}
        </h1>
      </div>
    </div>
  );
};
