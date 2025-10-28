/**
 * Framer Motion animation variants for consistent animations across the app
 * T031: Animation System Setup
 */

import { Variants } from 'framer-motion'

/**
 * Entrance animations
 */
export const entranceVariants = {
  /**
   * Fade in from transparent
   */
  fadeIn: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.4,
        ease: 'easeOut',
      },
    },
  } as Variants,

  /**
   * Fade in with slide up
   */
  slideUpFadeIn: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  } as Variants,

  /**
   * Fade in with slide down
   */
  slideDownFadeIn: {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  } as Variants,

  /**
   * Fade in with scale
   */
  scaleIn: {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: 'easeOut',
      },
    },
  } as Variants,

  /**
   * Staggered children animation container
   */
  staggerContainer: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  } as Variants,

  /**
   * Staggered item for use with staggerContainer
   */
  staggerItem: {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: 'easeOut',
      },
    },
  } as Variants,
}

/**
 * Hover animations
 */
export const hoverVariants = {
  /**
   * Subtle scale on hover
   */
  scaleHover: {
    rest: { scale: 1 },
    hover: {
      scale: 1.02,
      transition: {
        duration: 0.2,
        ease: 'easeInOut',
      },
    },
  } as Variants,

  /**
   * Pronounced scale on hover
   */
  scaleHoverLarge: {
    rest: { scale: 1 },
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.2,
        ease: 'easeInOut',
      },
    },
  } as Variants,

  /**
   * Lift effect with shadow on hover
   */
  liftHover: {
    rest: {
      y: 0,
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    },
    hover: {
      y: -4,
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      transition: {
        duration: 0.2,
        ease: 'easeInOut',
      },
    },
  } as Variants,

  /**
   * Border color change on hover
   */
  borderColorHover: {
    rest: { borderColor: '#e5e7eb' },
    hover: {
      borderColor: '#6366f1',
      transition: {
        duration: 0.2,
      },
    },
  } as Variants,

  /**
   * Combined lift and scale effect
   */
  elevateHover: {
    rest: {
      y: 0,
      scale: 1,
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    },
    hover: {
      y: -6,
      scale: 1.03,
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
      transition: {
        duration: 0.2,
        ease: 'easeInOut',
      },
    },
  } as Variants,
}

/**
 * Page transition animations
 */
export const pageVariants = {
  /**
   * Fade in/out page transition
   */
  pageTransition: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: 'easeOut',
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.2,
        ease: 'easeIn',
      },
    },
  } as Variants,

  /**
   * Fade in/out with slight slide up
   */
  pageSlideTransition: {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: 'easeOut',
      },
    },
    exit: {
      opacity: 0,
      y: -10,
      transition: {
        duration: 0.3,
        ease: 'easeIn',
      },
    },
  } as Variants,
}

/**
 * Exit animations
 */
export const exitVariants = {
  /**
   * Fade out
   */
  fadeOut: {
    exit: {
      opacity: 0,
      transition: {
        duration: 0.3,
        ease: 'easeIn',
      },
    },
  } as Variants,

  /**
   * Fade out with slide down
   */
  slideDownFadeOut: {
    exit: {
      opacity: 0,
      y: 20,
      transition: {
        duration: 0.3,
        ease: 'easeIn',
      },
    },
  } as Variants,
}

/**
 * Container animation configuration for lists
 */
export const containerVariants = (staggerDelay = 0.05) => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: staggerDelay,
      delayChildren: 0.05,
    },
  },
})

/**
 * Item animation for use in lists with containerVariants
 */
export const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
}

/**
 * Helper to create indexed delay for sequential animations
 */
export const createIndexDelay = (index: number, baseDelay = 0.1) => index * baseDelay
