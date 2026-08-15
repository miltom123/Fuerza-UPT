"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Maximize2, Pause, Play } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import styles from "./project-detail.module.css";

interface ProjectCarouselProps {
  images: string[];
  title: string;
  onExpand?: (index: number) => void;
}

export function ProjectCarousel({ images, title, onExpand }: ProjectCarouselProps) {
  const safeImages = images.length > 0 ? images : ["/images/hero-equipo.png"];
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev === 0 ? safeImages.length - 1 : prev - 1));
  }, [safeImages.length]);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev === safeImages.length - 1 ? 0 : prev + 1));
  }, [safeImages.length]);

  // Auto-play timer
  useEffect(() => {
    if (!isPlaying || isHovered || safeImages.length <= 1) return;
    const timer = setInterval(() => {
      handleNext();
    }, 4500);
    return () => clearInterval(timer);
  }, [isPlaying, isHovered, safeImages.length, handleNext]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev]);

  return (
    <div
      className={styles.carouselContainer}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={styles.carouselFrame}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            style={{ position: "absolute", inset: 0 }}
          >
            <Image
              src={safeImages[activeIndex]}
              alt={`${title} - foto ${activeIndex + 1}`}
              fill
              sizes="(max-width: 900px) 100vw, 420px"
              className={styles.carouselImage}
              priority
            />
          </motion.div>
        </AnimatePresence>

        {/* Expand Lightbox Button */}
        {onExpand && (
          <button
            type="button"
            className={styles.expandBtn}
            onClick={() => onExpand(activeIndex)}
            title="Ampliar foto"
            aria-label="Ampliar foto"
          >
            <Maximize2 size={16} />
          </button>
        )}

        {/* Auto-play toggle & Navigation controls */}
        {safeImages.length > 1 && (
          <>
            <button
              type="button"
              className={`${styles.carouselArrow} ${styles.carouselArrowLeft}`}
              onClick={handlePrev}
              aria-label="Imagen anterior"
            >
              <ChevronLeft size={20} />
            </button>

            <button
              type="button"
              className={`${styles.carouselArrow} ${styles.carouselArrowRight}`}
              onClick={handleNext}
              aria-label="Siguiente imagen"
            >
              <ChevronRight size={20} />
            </button>

            <div className={styles.carouselControlsBar}>
              <button
                type="button"
                className={styles.playPauseBtn}
                onClick={() => setIsPlaying(!isPlaying)}
                title={isPlaying ? "Pausar presentación" : "Reproducir presentación"}
              >
                {isPlaying ? <Pause size={12} /> : <Play size={12} />}
              </button>
              <div className={styles.counterBadge}>
                {activeIndex + 1} / {safeImages.length}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Dynamic Thumbnails Strip */}
      {safeImages.length > 1 && (
        <div className={styles.thumbnailRow} role="tablist" aria-label="Galería de imágenes">
          {safeImages.map((img, idx) => (
            <button
              key={`${img}-${idx}`}
              type="button"
              role="tab"
              aria-selected={idx === activeIndex}
              aria-label={`Ver imagen ${idx + 1}`}
              className={`${styles.thumbnailBtn} ${idx === activeIndex ? styles.activeThumb : ""}`}
              onClick={() => setActiveIndex(idx)}
            >
              <Image src={img} alt="" fill sizes="60px" style={{ objectFit: "cover" }} />
              {idx === activeIndex && <motion.div layoutId="activeThumbBorder" className={styles.thumbActiveGlow} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
