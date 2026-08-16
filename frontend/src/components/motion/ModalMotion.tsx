"use client";

import { motion, AnimatePresence } from "motion/react";
import { useReducedMotion } from "./useReducedMotion";

interface ModalMotionProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  backdropClassName?: string;
  cardClassName?: string;
}

export function ModalMotion({
  isOpen,
  onClose,
  children,
  backdropClassName = "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs",
  cardClassName = "relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden",
}: ModalMotionProps) {
  const reducedMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0.05 : 0.2 }}
          className={backdropClassName}
          onClick={onClose}
        >
          <motion.div
            initial={{
              opacity: 0,
              scale: reducedMotion ? 1 : 0.95,
              y: reducedMotion ? 0 : 16,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: reducedMotion ? 1 : 0.96,
              y: reducedMotion ? 0 : 12,
            }}
            transition={{
              duration: reducedMotion ? 0.05 : 0.25,
              ease: [0.16, 1, 0.3, 1],
            }}
            className={cardClassName}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
