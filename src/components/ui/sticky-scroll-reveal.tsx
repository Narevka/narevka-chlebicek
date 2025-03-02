"use client";
import React, { useEffect, useRef, useState } from "react";
import { useMotionValueEvent, useScroll, motion } from "framer-motion";
import { cn } from "@/lib/utils.ts";
import "./scrollbar.css";

export const StickyScroll = ({
  content,
  contentClassName,
}: {
  content: {
    title: string;
    description: string;
    content?: React.ReactNode | any;
  }[];
  contentClassName?: string;
}) => {
  // Always start with the first card active
  const [activeCard, setActiveCard] = React.useState(0);
  
  // Ref for the outer container to control initial scroll position
  const containerRef = useRef<HTMLDivElement>(null);
  const ref = useRef<any>(null);
  const { scrollYProgress } = useScroll({
    container: ref,
    offset: ["start start", "end start"],
  });
  const cardLength = content.length;

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const cardsBreakpoints = content.map((_, index) => index / cardLength);
    const closestBreakpointIndex = cardsBreakpoints.reduce(
      (acc, breakpoint, index) => {
        const distance = Math.abs(latest - breakpoint);
        if (distance < Math.abs(latest - cardsBreakpoints[acc])) {
          return index;
        }
        return acc;
      },
      0
    );
    setActiveCard(closestBreakpointIndex);
  });

  const backgroundColors = [
    "rgb(15 23 42)", // slate-900
    "rgb(0 0 0)", // black
    "rgb(23 23 23)", // neutral-900
  ];

  const linearGradients = [
    "linear-gradient(to bottom right, rgb(6 182 212), rgb(16 185 129))", // cyan-500 to emerald-500
    "linear-gradient(to bottom right, rgb(236 72 153), rgb(99 102 241))", // pink-500 to indigo-500
    "linear-gradient(to bottom right, rgb(249 115 22), rgb(234 179 8))", // orange-500 to yellow-500
  ];

  const [backgroundGradient, setBackgroundGradient] = useState(
    linearGradients[0]
  );

  useEffect(() => {
    setBackgroundGradient(linearGradients[activeCard % linearGradients.length]);
  }, [activeCard]);

  // Effect to ensure the first item is fully visible on initial render
  useEffect(() => {
    if (ref.current) {
      // Reset scroll position to top
      ref.current.scrollTop = 0;
    }
  }, []);

  return (
    <motion.div
      animate={{
        backgroundColor: backgroundColors[activeCard % backgroundColors.length],
      }}
      className="fixed inset-0 z-10"
    >
      {/* Mobile image - only visible on small screens */}
      <div 
        style={{ background: backgroundGradient }}
        className={cn(
          "lg:hidden h-40 w-64 rounded-md bg-white overflow-hidden mx-auto mt-16",
          contentClassName
        )}
      >
        {content[activeCard].content ?? null}
      </div>
      
      <div className="flex flex-col lg:flex-row items-center justify-center h-screen w-full">
        {/* Text column */}
        <div className="max-w-lg px-4">
          <div 
            className="h-screen overflow-y-auto flex items-center px-8 pt-0 pb-32 scrollbar-hidden relative"
            ref={ref}
            style={{
              scrollbarWidth: 'none',
              paddingTop: '0px',
              marginTop: '0px',
              transform: 'translateY(calc(50vh - 180px))', /* Adjusted to move text down */
              maskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)',
            }}
          >
            <div className="py-8 px-2">
              {/* First item with extra padding to ensure it's fully visible */}
              <div key={content[0].title} className="pt-24 pb-16">
                <motion.h2
                  initial={{
                    opacity: 0,
                  }}
                  animate={{
                    opacity: activeCard === 0 ? 1 : 0.3,
                  }}
                  className="text-3xl font-extrabold text-white mb-4"
                >
                  {content[0].title}
                </motion.h2>
                <motion.p
                  initial={{
                    opacity: 0,
                  }}
                  animate={{
                    opacity: activeCard === 0 ? 1 : 0.3,
                  }}
                  className="text-kg text-white font-medium max-w-sm mt-4"
                >
                  {content[0].description}
                </motion.p>
              </div>
              
              {/* Rest of the items */}
              {content.slice(1).map((item, index) => (
                <div key={item.title + (index + 1)} className="my-16">
                  <motion.h2
                    initial={{
                      opacity: 0,
                    }}
                    animate={{
                    opacity: activeCard === index + 1 ? 1 : 0.3,
                    }}
                    className="text-3xl font-extrabold text-white mb-4"
                  >
                    {item.title}
                  </motion.h2>
                  <motion.p
                    initial={{
                      opacity: 0,
                    }}
                    animate={{
                      opacity: activeCard === index + 1 ? 1 : 0.3,
                    }}
                  className="text-kg text-white font-medium max-w-sm mt-4"
                  >
                    {item.description}
                  </motion.p>
                </div>
              ))}
              <div className="h-40" />
            </div>
          </div>
        </div>
        
        {/* Image column */}
        <div className="hidden lg:block ml-4">
          <div
            style={{ 
              background: backgroundGradient,
              height: "30rem", /* 480px (1.5x of h-80) */
              width: "36rem"   /* 576px (1.5x of w-96) */
            }}
            className={cn(
              "rounded-md bg-white overflow-hidden",
              contentClassName
            )}
          >
            {content[activeCard].content ?? null}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
