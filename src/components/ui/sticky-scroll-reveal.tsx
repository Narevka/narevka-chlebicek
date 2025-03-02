
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
  const [activeCard, setActiveCard] = React.useState(0);
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
      
      <div className="grid grid-cols-1 lg:grid-cols-2 h-screen">
        {/* Text column */}
        <div className="flex justify-center items-center h-screen">
          <div 
            className="h-screen overflow-y-auto px-8 py-0 scrollbar-hidden flex flex-col"
            ref={ref}
            style={{
              scrollbarWidth: 'none',
            }}
          >
            {/* Increased empty space at top to push content down further */}
            <div className="h-[60vh]" />
            
            <div className="max-w-xl">
              {content.map((item, index) => (
                <div key={item.title + index} className="my-24">
                  <motion.h2
                    initial={{
                      opacity: 0,
                    }}
                    animate={{
                      opacity: activeCard === index ? 1 : 0.3,
                    }}
                    className="text-2xl font-bold text-slate-100 text-center lg:text-left"
                  >
                    {item.title}
                  </motion.h2>
                  <motion.p
                    initial={{
                      opacity: 0,
                    }}
                    animate={{
                      opacity: activeCard === index ? 1 : 0.3,
                    }}
                    className="text-kg text-slate-300 max-w-sm mt-10 text-center mx-auto lg:text-left lg:mx-0"
                  >
                    {item.description}
                  </motion.p>
                </div>
              ))}
            </div>
            
            {/* Empty space at bottom to ensure content stays centered */}
            <div className="h-[20vh]" />
          </div>
        </div>
        
        {/* Image column */}
        <div className="hidden lg:flex items-center justify-center">
          <div
            style={{ background: backgroundGradient }}
            className={cn(
              "h-80 w-96 rounded-md bg-white overflow-hidden",
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
