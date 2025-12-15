/**
 * Framer Motion animation variants for landing page
 * All animations use GPU-accelerated properties (transform, opacity)
 * Target: 60fps performance
 */

export const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
};

export const fadeInDown = {
  initial: { opacity: 0, y: -40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
};

export const fadeInLeft = {
  initial: { opacity: 0, x: -60 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
};

export const fadeInRight = {
  initial: { opacity: 0, x: 60 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.92 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5, ease: "easeOut" },
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

export const hoverScale = {
  whileHover: { scale: 1.05 },
  transition: { duration: 0.2, ease: "easeOut" },
};

export const hoverShadow = {
  whileHover: {
    boxShadow: "0 20px 25px -5px rgba(124, 58, 237, 0.2)",
  },
  transition: { duration: 0.3 },
};

export const slideInFromLeft = {
  initial: { opacity: 0, x: -100 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.7, ease: "easeOut" },
};

export const slideInFromRight = {
  initial: { opacity: 0, x: 100 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.7, ease: "easeOut" },
};

export const expandWidth = {
  initial: { scaleX: 0 },
  animate: { scaleX: 1 },
  transition: { duration: 0.8, ease: "easeOut" },
};

export const cardVariant = {
  initial: { opacity: 0, y: 20, scale: 0.95 },
  whileInView: { opacity: 1, y: 0, scale: 1 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.5, ease: "easeOut" },
};

export const textVariant = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
};

export const buttonHover = {
  whileHover: {
    scale: 1.05,
    boxShadow: "0 20px 25px -5px rgba(124, 58, 237, 0.4)",
  },
  whileTap: { scale: 0.98 },
  transition: { duration: 0.2, ease: "easeOut" },
};

export const pulseGlow = {
  animate: {
    boxShadow: [
      "0 0 20px rgba(124, 58, 237, 0.4)",
      "0 0 40px rgba(124, 58, 237, 0.6)",
      "0 0 20px rgba(124, 58, 237, 0.4)",
    ],
  },
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: "easeInOut",
  },
};

export const rotateIn = {
  initial: { opacity: 0, rotate: -10 },
  animate: { opacity: 1, rotate: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
};

export const gradientShift = {
  animate: {
    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
  },
  transition: {
    duration: 6,
    repeat: Infinity,
    ease: "easeInOut",
  },
};

/**
 * Counter animation for stats
 * Use with useEffect + requestAnimationFrame for smooth 60fps
 */
export const counterAnimation = {
  animate: {
    opacity: 1,
  },
  initial: {
    opacity: 0,
  },
  transition: {
    duration: 0.3,
  },
};

/**
 * Section entry animations (used with useInView from Intersection Observer)
 */
export const sectionEntryAnimation = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut",
    },
  },
};

/**
 * Timeline animations
 */
export const timelineItemAnimation = {
  initial: { opacity: 0, x: 0 },
  whileInView: { opacity: 1, x: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.6, ease: "easeOut" },
};

export const timelineConnectorAnimation = {
  initial: { scaleY: 0 },
  animate: { scaleY: 1 },
  transition: { duration: 1, ease: "easeOut" },
  transformOrigin: "top",
};
