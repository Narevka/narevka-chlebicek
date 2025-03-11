
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
  // Track the current step of animation
  const [currentStep, setCurrentStep] = useState(0);
  
  // Track if we're currently typing or deleting
  const [isTyping, setIsTyping] = useState(true);
  
  // Track the current text being displayed
  const [displayText, setDisplayText] = useState("");
  
  // Define our texts for each step
  const texts = [
    "Buil",
    "Build awesome apps with Ace",
    "Build awesome apps with Aceternity."
  ];
  
  // Typing speed in milliseconds
  const typingSpeed = 100;
  const deleteSpeed = 50;
  // Pause at complete text
  const pauseTime = 1500;

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    // When typing is complete for the current step
    if (isTyping && displayText === texts[currentStep]) {
      // Pause before starting to delete
      timeout = setTimeout(() => {
        if (currentStep < texts.length - 1) {
          setIsTyping(false);
        }
      }, pauseTime);
    } 
    // When typing is in progress
    else if (isTyping && displayText.length < texts[currentStep].length) {
      // Add next character
      timeout = setTimeout(() => {
        setDisplayText(texts[currentStep].slice(0, displayText.length + 1));
      }, typingSpeed);
    } 
    // When deleting is in progress
    else if (!isTyping && displayText.length > 0) {
      // Remove last character
      timeout = setTimeout(() => {
        setDisplayText(displayText.slice(0, -1));
      }, deleteSpeed);
    } 
    // When deleting is complete
    else if (!isTyping && displayText.length === 0) {
      // Move to next step and start typing again
      setCurrentStep((prev) => (prev + 1) % texts.length);
      setIsTyping(true);
    }
    
    return () => clearTimeout(timeout);
  }, [currentStep, displayText, isTyping, texts]);

  // Function to render the text with proper styling
  const renderText = () => {
    if (currentStep === 0) {
      // For the first step, just render the text directly
      return <span>{displayText}</span>;
    } else {
      // For other steps, split the text to style "Ace" or "Aceternity" differently
      const words = displayText.split(" ");
      
      return (
        <>
          {words.map((word, index) => (
            <span key={index} className={index === words.length - 1 ? "text-blue-500" : ""}>
              {index > 0 ? " " : ""}{word}
            </span>
          ))}
        </>
      );
    }
  };

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <div className="text-center">
        <h1 className="text-4xl font-bold leading-tight sm:text-5xl md:text-6xl lg:text-7xl">
          {renderText()}
          <span className={cn("animate-pulse", cursorClassName)}>|</span>
        </h1>
      </div>
    </div>
  );
};
