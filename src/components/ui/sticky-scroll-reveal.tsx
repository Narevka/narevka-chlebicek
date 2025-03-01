"use client";
import React, { useEffect, useRef, useState } from "react";
import { useMotionValueEvent, useScroll } from "framer-motion";
import { motion } from "framer-motion";
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
        {/* Text column - centered on mobile, left-aligned on desktop */}
        <div className="flex justify-center lg:justify-end">
          <div 
            className="h-screen overflow-y-auto flex items-center px-8 pt-20 lg:pt-20 pb-32 scrollbar-hidden"
            ref={ref}
            style={{
              scrollbarWidth: 'none',
              paddingTop: 'calc(4rem + var(--mobile-image-height, 0px))',
            }}
          >
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
                    className="text-2xl font-bold text-slate-100"
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
                    className="text-kg text-slate-300 max-w-sm mt-10"
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
