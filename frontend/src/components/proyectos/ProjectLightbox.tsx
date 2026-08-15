"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import styles from "./project-detail.module.css";

interface ProjectLightboxProps {
  images: string[];
  initialIndex?: number;
  onClose: () => void;
}

export function ProjectLightbox({ images, initialIndex = 0, onClose }: ProjectLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev, onClose]);

  if (!images.length) return null;

  return (
    <div className={styles.lightboxOverlay} onClick={onClose} role="dialog" aria-modal="true">
      <motion.div
        className={styles.lightboxModal}
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.25 }}
      >
        <button
          type="button"
          className={styles.lightboxCloseBtn}
          onClick={onClose}
          aria-label="Cerrar vista amplia"
        >
          <X size={24} />
        </button>

        <div className={styles.lightboxImageFrame}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.25 }}
              style={{ position: "absolute", inset: 0 }}
            >
              <Image
                src={images[currentIndex]}
                alt={`Evidencia ${currentIndex + 1}`}
                fill
                sizes="100vw"
                priority
                style={{ objectFit: "contain" }}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {images.length > 1 && (
          <>
            <button
              type="button"
              className={`${styles.lightboxArrow} ${styles.lightboxArrowLeft}`}
              onClick={handlePrev}
              aria-label="Anterior evidencia"
            >
              <ChevronLeft size={28} />
            </button>
            <button
              type="button"
              className={`${styles.lightboxArrow} ${styles.lightboxArrowRight}`}
              onClick={handleNext}
              aria-label="Siguiente evidencia"
            >
              <ChevronRight size={28} />
            </button>

            {/* Lightbox Thumbnails Strip */}
            <div className={styles.lightboxThumbStrip}>
              {images.map((img, idx) => (
                <button
                  key={`${img}-${idx}`}
                  type="button"
                  className={`${styles.lightboxThumbBtn} ${idx === currentIndex ? styles.activeLightboxThumb : ""}`}
                  onClick={() => setCurrentIndex(idx)}
                >
                  <Image src={img} alt="" fill sizes="50px" style={{ objectFit: "cover" }} />
                </button>
              ))}
            </div>
          </>
        )}

        <div className={styles.lightboxCaption}>
          Evidencia {currentIndex + 1} de {images.length}
        </div>
      </motion.div>
    </div>
  );
}
