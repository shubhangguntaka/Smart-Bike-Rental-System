import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export interface TiltedCardProps {
  imageSrc: string;
  altText?: string;
  captionText?: string;
  containerHeight?: React.CSSProperties['height'];
  containerWidth?: React.CSSProperties['width'];
  imageHeight?: React.CSSProperties['height'];
  imageWidth?: React.CSSProperties['width'];
  scaleOnHover?: number;
  rotateAmplitude?: number;
  showMobileWarning?: boolean;
  showTooltip?: boolean;
  overlayContent?: React.ReactNode;
  displayOverlayContent?: boolean;
  imageFit?: 'cover' | 'contain' | 'fill' | 'scale-down';
  cardClassName?: string;
  imageClassName?: string;
}

const springValues = {
  damping: 30,
  stiffness: 100,
  mass: 2
};

export default function TiltedCard({
  imageSrc,
  altText = 'Tilted card image',
  captionText = '',
  containerHeight = '320px',
  containerWidth = '100%',
  imageHeight = '320px',
  imageWidth = '100%',
  scaleOnHover = 1.05,
  rotateAmplitude = 12,
  showMobileWarning = false,
  showTooltip = true,
  overlayContent = null,
  displayOverlayContent = false,
  imageFit = 'cover',
  cardClassName = '',
  imageClassName = ''
}: TiltedCardProps) {
  const ref = useRef<HTMLElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useMotionValue(0), springValues);
  const rotateY = useSpring(useMotionValue(0), springValues);
  const scale = useSpring(1, springValues);
  const opacity = useSpring(0);
  const rotateFigcaption = useSpring(0, {
    stiffness: 350,
    damping: 30,
    mass: 1
  });

  const [lastY, setLastY] = useState(0);

  function handleMouse(e: React.MouseEvent<HTMLElement>) {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - rect.width / 2;
    const offsetY = e.clientY - rect.top - rect.height / 2;

    const rotationX = (offsetY / (rect.height / 2)) * -rotateAmplitude;
    const rotationY = (offsetX / (rect.width / 2)) * rotateAmplitude;

    rotateX.set(rotationX);
    rotateY.set(rotationY);

    x.set(e.clientX - rect.left);
    y.set(e.clientY - rect.top);

    const velocityY = offsetY - lastY;
    rotateFigcaption.set(-velocityY * 0.6);
    setLastY(offsetY);
  }

  function handleMouseEnter() {
    scale.set(scaleOnHover);
    opacity.set(1);
  }

  function handleMouseLeave() {
    opacity.set(0);
    scale.set(1);
    rotateX.set(0);
    rotateY.set(0);
    rotateFigcaption.set(0);
  }

  const getImageFitClass = () => {
    switch (imageFit) {
      case 'contain':
        return 'object-contain p-4 sm:p-6';
      case 'fill':
        return 'object-fill';
      case 'scale-down':
        return 'object-scale-down p-4';
      default:
        return 'object-cover';
    }
  };

  return (
    <figure
      ref={ref}
      className="relative w-full h-full [perspective:800px] flex flex-col items-center justify-center cursor-pointer select-none"
      style={{
        height: containerHeight,
        width: containerWidth
      }}
      onMouseMove={handleMouse}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {showMobileWarning && (
        <div className="absolute top-4 text-center text-xs text-muted-foreground block sm:hidden">
          Hover with desktop pointer for 3D tilt effect
        </div>
      )}

      <motion.div
        className={`relative [transform-style:preserve-3d] w-full h-full rounded-2xl overflow-hidden border border-border/80 shadow-xl ${cardClassName}`.trim()}
        style={{
          width: imageWidth,
          height: imageHeight,
          rotateX,
          rotateY,
          scale
        }}
      >
        <motion.img
          src={imageSrc}
          alt={altText}
          className={`absolute top-0 left-0 w-full h-full rounded-2xl will-change-transform [transform:translateZ(0)] ${getImageFitClass()} ${imageClassName}`.trim()}
          style={{
            width: imageWidth,
            height: imageHeight
          }}
        />

        {/* Ambient Gradient Vignette for readable overlays when in cover mode */}
        {imageFit === 'cover' && (
          <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-transparent z-[1] pointer-events-none" />
        )}

        {displayOverlayContent && overlayContent && (
          <motion.div className="absolute inset-0 z-[2] will-change-transform [transform:translateZ(30px)] flex flex-col justify-end p-4 sm:p-6 pointer-events-none">
            {overlayContent}
          </motion.div>
        )}
      </motion.div>

      {showTooltip && captionText && (
        <motion.figcaption
          className="pointer-events-none absolute left-0 top-0 rounded-md bg-card/95 backdrop-blur-md border border-border/80 px-3 py-1.5 text-xs font-semibold text-foreground opacity-0 z-[10] shadow-lg hidden sm:block whitespace-nowrap"
          style={{
            x,
            y,
            opacity,
            rotate: rotateFigcaption
          }}
        >
          {captionText}
        </motion.figcaption>
      )}
    </figure>
  );
}
