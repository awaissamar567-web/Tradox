"use client";

import React from "react";
import { cn } from "../../lib/utils";
import { Sparkles } from "lucide-react";

interface DisplayCardProps {
  className?: string;
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  date?: string;
  iconClassName?: string;
  titleClassName?: string;
}

function DisplayCard({
  className,
  icon = <Sparkles className="size-4 text-accent" />,
  title = "Featured",
  description = "Discover amazing content",
  date = "Just now",
  iconClassName = "text-accent",
  titleClassName = "text-textPrimary",
}: DisplayCardProps) {
  return (
    <div
      className={cn(
        "relative flex min-h-[12rem] w-[17rem] sm:w-[22rem] md:w-[24rem] -skew-y-[6deg] select-none flex-col justify-between rounded-2xl border border-customBorder bg-bgSurface/85 backdrop-blur-md px-5 py-4 transition-all duration-700 hover:border-accent/30 hover:bg-bgElevated [&>*]:flex [&>*]:items-center [&>*]:gap-2 shadow-2xl hover:scale-[1.02] hover:z-50",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <span className={cn("relative inline-block rounded-xl bg-accentDim p-2 text-accent border border-accent/10", iconClassName)}>
          {icon}
        </span>
        <p className={cn("text-xs sm:text-[13px] font-syne font-extrabold uppercase tracking-wide", titleClassName)}>{title}</p>
      </div>
      <p className="text-[11px] text-textSecondary font-light leading-relaxed mt-2 flex-1">{description}</p>
      <p className="text-[8.5px] font-mono text-textMuted uppercase tracking-widest mt-2">{date}</p>
    </div>
  );
}

interface DisplayCardsProps {
  cards?: DisplayCardProps[];
}

export default function DisplayCards({ cards }: DisplayCardsProps) {
  const defaultCards = [
    {
      className: "[grid-area:stack] hover:-translate-y-10 before:absolute before:w-[100%] before:rounded-xl before:h-[100%] before:content-[''] before:bg-bgBase/40 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
    },
    {
      className: "[grid-area:stack] translate-x-12 translate-y-10 hover:-translate-y-1 before:absolute before:w-[100%] before:rounded-xl before:h-[100%] before:content-[''] before:bg-bgBase/40 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
    },
    {
      className: "[grid-area:stack] translate-x-24 translate-y-20 hover:translate-y-10",
    },
  ];

  const displayCards = cards || defaultCards;

  return (
    <div className="grid [grid-template-areas:'stack'] place-items-center opacity-100 animate-in fade-in-0 duration-700 py-10 pr-12 sm:pr-24">
      {displayCards.map((cardProps, index) => (
        <DisplayCard key={index} {...cardProps} />
      ))}
    </div>
  );
}
