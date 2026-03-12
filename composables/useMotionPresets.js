export function useMotionPresets() {
  const fadeUp = {
    initial: { opacity: 0, y: 30 },
    inView: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: 'easeOut' },
  }

  const fadeUpSlow = {
    initial: { opacity: 0, y: 40 },
    inView: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: 'easeOut' },
  }

  const popBottom = {
    initial: { opacity: 0, y: 100, scale: 0.9 },
    inView: { opacity: 1, y: 0, scale: 1 },
    transition: { type: 'spring', stiffness: 250, damping: 25 },
  }

  const slideLeft = {
    initial: { opacity: 0, x: -80 },
    inView: { opacity: 1, x: 0 },
    transition: { duration: 0.6, ease: 'easeOut' },
  }

  const slideRight = {
    initial: { opacity: 0, x: 80 },
    inView: { opacity: 1, x: 0 },
    transition: { duration: 0.6, ease: 'easeOut' },
  }

  const scaleIn = {
    initial: { opacity: 0, scale: 0.9 },
    inView: { opacity: 1, scale: 1 },
    transition: { type: 'spring', stiffness: 200, damping: 20 },
  }

  const springTap = { scale: 0.97 }
  const springHover = { scale: 1.02, transition: { type: 'spring', stiffness: 400, damping: 15 } }

  const staggerContainer = {
    initial: { opacity: 0 },
    inView: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  }

  const staggerItem = {
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
