interface MotionState {
  opacity?: number
  y?: number
  x?: number
  scale?: number
  transition?: Record<string, unknown>
}

interface MotionPreset {
  initial: MotionState
  inView: MotionState
  transition?: Record<string, unknown>
}

export function useMotionPresets() {
  const fadeUp: MotionPreset = {
    initial: { opacity: 0, y: 30 },
    inView: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: 'easeOut' },
  }

  const fadeUpSlow: MotionPreset = {
    initial: { opacity: 0, y: 40 },
    inView: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: 'easeOut' },
  }

  const popBottom: MotionPreset = {
    initial: { opacity: 0, y: 100, scale: 0.9 },
    inView: { opacity: 1, y: 0, scale: 1 },
    transition: { type: 'spring', stiffness: 250, damping: 25 },
  }

  const slideLeft: MotionPreset = {
    initial: { opacity: 0, x: -80 },
    inView: { opacity: 1, x: 0 },
    transition: { duration: 0.6, ease: 'easeOut' },
  }

  const slideRight: MotionPreset = {
    initial: { opacity: 0, x: 80 },
    inView: { opacity: 1, x: 0 },
    transition: { duration: 0.6, ease: 'easeOut' },
  }

  const scaleIn: MotionPreset = {
    initial: { opacity: 0, scale: 0.9 },
    inView: { opacity: 1, scale: 1 },
    transition: { type: 'spring', stiffness: 200, damping: 20 },
  }

  const springTap: MotionState = { scale: 0.97 }
  const springHover: MotionState = { scale: 1.02, transition: { type: 'spring', stiffness: 400, damping: 15 } }

  const staggerContainer: MotionPreset = {
    initial: { opacity: 0 },
    inView: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  }

  const staggerItem: MotionPreset = {
    initial: { opacity: 0, y: 20 },
    inView: { opacity: 1, y: 0 },
  }

  return {
    fadeUp,
    fadeUpSlow,
    popBottom,
    slideLeft,
    slideRight,
    scaleIn,
    springTap,
    springHover,
    staggerContainer,
    staggerItem,
  }
}
