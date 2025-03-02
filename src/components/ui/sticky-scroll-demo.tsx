"use client";
import React from "react";
import { StickyScroll } from "@/components/ui/sticky-scroll-reveal.tsx";

const content = [
  {
    title: "FIRST ITEM - Collaborative Editing",
    description:
      "THIS IS THE FIRST ITEM TEXT - Work together in real time with your team, clients, and stakeholders. Collaborate on documents, share ideas, and make decisions quickly. With our platform, you can streamline your workflow and increase productivity.",
    content: (
      <div className="h-full w-full bg-[linear-gradient(to_bottom_right,var(--cyan-500),var(--emerald-500))] flex items-center justify-center text-white">
        Collaborative Editing
      </div>
    ),
  },
  {
    title: "SECOND ITEM - Random Text",
    description:
      "THIS IS COMPLETELY DIFFERENT TEXT. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisi vel consectetur interdum, nisl nisi consectetur purus, eget porttitor nisl nisl sit amet magna. Fusce iaculis lorem et dui euismod, eget luctus nibh faucibus.",
    content: (
      <div className="h-full w-full flex items-center justify-center text-white">
        Real-time Changes
      </div>
    ),
  },
  {
    title: "Version control",
    description:
      "Experience real-time updates and never stress about version control again. Our platform ensures that you're always working on the most recent version of your project, eliminating the need for constant manual updates. Stay in the loop, keep your team aligned, and maintain the flow of your work without any interruptions.",
    content: (
      <div className="h-full w-full bg-[linear-gradient(to_bottom_right,var(--orange-500),var(--yellow-500))] flex items-center justify-center text-white">
        Version control
      </div>
    ),
  },
  {
    title: "Running out of content",
    description:
      "Experience real-time updates and never stress about version control again. Our platform ensures that you're always working on the most recent version of your project, eliminating the need for constant manual updates. Stay in the loop, keep your team aligned, and maintain the flow of your work without any interruptions.",
    content: (
      <div className="h-full w-full bg-[linear-gradient(to_bottom_right,var(--cyan-500),var(--emerald-500))] flex items-center justify-center text-white">
        Running out of content
      </div>
    ),
  },
];

export function StickyScrollDemo() {
  return (
    <div className="w-full">
      <StickyScroll content={content} />
    </div>
  );
}
