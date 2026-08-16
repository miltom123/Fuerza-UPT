"use client";

import { motion, type HTMLMotionProps } from "motion/react";
import { useReducedMotion } from "./useReducedMotion";

interface MotionButtonProps extends HTMLMotionProps<"button"> {
  hoverScale?: number;
  tapScale?: number;
}

export function MotionButton({
  children,
  hoverScale = 1.02,
  tapScale = 0.97,
  className = "",
  ...props
}: MotionButtonProps) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.button
      whileHover={reducedMotion ? undefined : { scale: hoverScale }}
      whileTap={reducedMotion ? undefined : { scale: tapScale }}
      transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
      className={className}
      {...props}
    >
      {children}
    </motion.button>
  );
}
