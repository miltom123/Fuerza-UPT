"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";
import { motion } from "motion/react";
import { useReducedMotion } from "./useReducedMotion";

interface ImageRevealProps extends ImageProps {
  wrapperClassName?: string;
  zoomOnHover?: boolean;
}

export function ImageReveal({
  wrapperClassName = "",
  zoomOnHover = true,
  className = "",
  alt,
  ...props
}: ImageRevealProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      className={`relative overflow-hidden ${wrapperClassName}`}
      whileHover={zoomOnHover && !reducedMotion ? { scale: 1.025 } : undefined}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      <Image
        alt={alt}
        className={`transition-all duration-500 ease-out ${
          isLoaded ? "opacity-100 blur-0" : "opacity-0 blur-xs"
        } ${className}`}
        onLoad={() => setIsLoaded(true)}
        {...props}
      />
    </motion.div>
  );
}
