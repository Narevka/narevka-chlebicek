
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
  const [currentWord, setCurrentWord] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(150);

  useEffect(() => {
    const word = words[currentWord]?.text || "";
    const typeSpeed = isDeleting ? 80 : 150;

    const timer = setTimeout(() => {
      if (!isDeleting && currentText.length < word.length) {
        // Still typing the current word
        setCurrentText(word.substring(0, currentText.length + 1));
        setTypingSpeed(150 - Math.random() * 50);
      } else if (isDeleting && currentText.length > 0) {
        // Deleting the current word
        setCurrentText(word.substring(0, currentText.length - 1));
        setTypingSpeed(80);
      } else if (currentText.length === word.length) {
        // Finished typing, wait before deleting
        setIsDeleting(true);
        setTypingSpeed(2000);
      } else {
        // Move to the next word
        setIsDeleting(false);
        setCurrentWord((prev) => (prev + 1) % words.length);
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [currentText, currentWord, isDeleting, typingSpeed, words]);

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <div className="text-center">
        <h1 className="text-3xl font-bold sm:text-4xl md:text-5xl">
          {words.map((word, index) => {
            if (index < currentWord) {
              return (
                <span key={index} className={word.className}>
                  {index === 0 ? word.text : ` ${word.text}`}{" "}
                </span>
              );
            }
            if (index === currentWord) {
              return (
                <span key={index} className={word.className}>
                  {index === 0 ? currentText : ` ${currentText}`}
                </span>
              );
            }
            return null;
          })}
          <span className={cn("animate-pulse", cursorClassName)}>|</span>
        </h1>
      </div>
    </div>
  );
};
