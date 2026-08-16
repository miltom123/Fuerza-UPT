"use client";

import { motion, type HTMLMotionProps } from "motion/react";
import { useReducedMotion } from "./useReducedMotion";

interface RevealProps extends HTMLMotionProps<"div"> {
  delay?: number;
  duration?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  distance?: number;
  threshold?: number;
  once?: boolean;
}

export function Reveal({
  children,
  delay = 0,
  duration = 0.5,
  direction = "up",
  distance = 24,
  threshold = 0.15,
  once = true,
  className,
  ...props
}: RevealProps) {
  const reducedMotion = useReducedMotion();

  const getInitialY = () => {
    if (reducedMotion || direction === "none") return 0;
    if (direction === "up") return distance;
    if (direction === "down") return -distance;
    return 0;
  };

  const getInitialX = () => {
    if (reducedMotion || direction === "none") return 0;
    if (direction === "left") return distance;
    if (direction === "right") return -distance;
    return 0;
  };

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: getInitialY(),
        x: getInitialX(),
      }}
      whileInView={{
        opacity: 1,
        y: 0,
        x: 0,
      }}
      viewport={{ once, amount: threshold }}
      transition={{
        duration: reducedMotion ? 0.05 : duration,
        delay: reducedMotion ? 0 : delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
