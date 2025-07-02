// Framer Motion animation variants for page transitions

// Page transition variants (for route changes)
export const pageVariants = {
  initial: { 
    opacity: 0, 
    scale: 0.95
  },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.0, 0.0, 0.2, 1]
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    transition: {
      duration: 0.2,
      ease: [0.4, 0.0, 1, 1]
    }
  }
}

// Phase transition variants (for Room component phases)
export const phaseVariants = {
  initial: { 
    opacity: 0, 
    scale: 0.98
  },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.0, 0.0, 0.2, 1]
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.98,
    transition: {
      duration: 0.2,
      ease: [0.4, 0.0, 1, 1]
    }
  }
}

// Reduced motion support
export const shouldReduceMotion = () => {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

// Reduced motion variants (instant transitions)
export const reducedMotionVariants = {
  initial: {},
  animate: {},
  exit: {}
}

// Helper function to get motion-safe variants
export const getMotionSafeVariants = (variants, prefersReducedMotion) => {
  return prefersReducedMotion ? reducedMotionVariants : variants
}