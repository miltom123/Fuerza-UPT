"use client";

import { useState } from "react";
import Image from "next/image";
import { Maximize2 } from "lucide-react";
import { motion } from "motion/react";
import styles from "./project-detail.module.css";

interface VerticalPhotoMarqueeProps {
  images: string[];
  onImageClick: (index: number) => void;
}

const defaultPhotos = [
  "/images/hero-equipo.png",
  "/images/fuerza-upt-equipo.jpg",
  "/images/hero-equipo.png",
  "/images/fuerza-upt-equipo.jpg",
  "/images/hero-equipo.png",
];

export function VerticalPhotoMarquee({ images, onImageClick }: VerticalPhotoMarqueeProps) {
  const [isPaused, setIsPaused] = useState(false);

  const rawImages = images && images.length > 0 ? images : defaultPhotos;
  // Duplicate array so vertical seamless looping never runs out of items
  const displayList = [...rawImages, ...rawImages, ...rawImages];

  return (
    <div
      className={styles.marqueeContainer}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <motion.div
        className={styles.marqueeTrack}
        animate={{
          y: isPaused ? undefined : ["-50%", "0%"],
        }}
        transition={{
          y: {
            repeat: Infinity,
            repeatType: "loop",
            duration: Math.max(38, rawImages.length * 10),
            ease: "linear",
          },
        }}
      >
        {displayList.map((imgUrl, idx) => {
          const originalIdx = idx % rawImages.length;
          return (
            <motion.div
              key={`${imgUrl}-${idx}`}
              whileHover={{ scale: 1.02 }}
              className={styles.marqueeCard}
              onClick={() => onImageClick(originalIdx)}
              role="button"
              tabIndex={0}
            >
              <Image
                src={imgUrl}
                alt={`Evidencia ${originalIdx + 1}`}
                fill
                sizes="300px"
                className={styles.marqueeImage}
              />
              <div className={styles.marqueeOverlay}>
                <span className={styles.marqueeZoomBadge}>
                  <Maximize2 size={13} /> Ver foto
                </span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
