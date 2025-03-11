
"use client";

import { cn } from "@/lib/utils";
import { motion, useAnimate, useInView } from "framer-motion";
import { useEffect } from "react";

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
  // Use default text if no words are provided
  const defaultText = "Build awesome apps with Aceternity.";
  const textToUse = words.length > 0 
    ? words.map(word => word.text).join(" ") 
    : defaultText;
  
  // Create animation controls
  const [scope, animate] = useAnimate();
  const isInView = useInView(scope);
  
  useEffect(() => {
    if (isInView) {
      animate(
        scope.current,
        { width: "fit-content" },
        { duration: 2, ease: "linear" }
      );
    }
  }, [isInView, animate, scope]);

  // Split the text to style "Aceternity" differently
  const renderStyledText = () => {
    if (textToUse.includes("with ")) {
      const parts = textToUse.split("with ");
      return (
        <>
          <span>{parts[0]}with </span>
          <span className="text-blue-500">{parts[1]}</span>
        </>
      );
    }
    return <span>{textToUse}</span>;
  };

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <div className="text-center flex items-center">
        <motion.div
          ref={scope}
          className="overflow-hidden whitespace-nowrap"
          initial={{ width: "0%" }}
          style={{ width: "0%" }}
        >
          <h1 className="text-2xl font-bold leading-tight sm:text-3xl md:text-4xl lg:text-5xl whitespace-nowrap">
            {renderStyledText()}
          </h1>
        </motion.div>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          className={cn("animate-pulse h-10 ml-1", cursorClassName)}
        >
          |
        </motion.span>
      </div>
    </div>
  );
};
