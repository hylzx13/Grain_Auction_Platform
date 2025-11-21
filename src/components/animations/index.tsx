import React, { ReactNode, useEffect, useRef } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { useMediaQuery, useTheme } from '@mui/material';

// 动画变体定义
export const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export const slideIn = {
  hidden: { x: -30, opacity: 0 },
  visible: { x: 0, opacity: 1 },
};

export const scaleIn = {
  hidden: { scale: 0.95, opacity: 0 },
  visible: { scale: 1, opacity: 1 },
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// 通用淡入组件
export interface FadeInProps {
  children: ReactNode;
  duration?: number;
  delay?: number;
  className?: string;
}

export const FadeIn: React.FC<FadeInProps> = ({ 
  children, 
  duration = 0.5, 
  delay = 0,
  className = '' 
}) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration,
            delay,
            ease: "easeOut"
          }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// 滑入组件
export interface SlideInProps {
  children: ReactNode;
  direction?: 'left' | 'right' | 'top' | 'bottom';
  duration?: number;
  delay?: number;
  className?: string;
}

export const SlideIn: React.FC<SlideInProps> = ({ 
  children, 
  direction = 'left', 
  duration = 0.4, 
  delay = 0,
  className = '' 
}) => {
  const getInitialVariants = () => {
    switch (direction) {
      case 'left':
        return { x: -50, opacity: 0 };
      case 'right':
        return { x: 50, opacity: 0 };
      case 'top':
        return { y: -50, opacity: 0 };
      case 'bottom':
        return { y: 50, opacity: 0 };
      default:
        return { x: -50, opacity: 0 };
    }
  };

  return (
    <motion.div
      initial={getInitialVariants()}
      animate={{ x: 0, y: 0, opacity: 1 }}
      transition={{
        duration,
        delay,
        ease: "easeOut"
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// 缩放组件
export interface ScaleInProps {
  children: ReactNode;
  duration?: number;
  delay?: number;
  className?: string;
}

export const ScaleIn: React.FC<ScaleInProps> = ({ 
  children, 
  duration = 0.4, 
  delay = 0,
  className = '' 
}) => {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        duration,
        delay,
        ease: "easeOut"
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// 滚动显示组件
export interface ScrollRevealProps {
  children: ReactNode;
  threshold?: number;
  offset?: string;
  duration?: number;
  className?: string;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({ 
  children, 
  threshold = 0.1, 
  offset = "100px",
  duration = 0.6,
  className = '' 
}) => {
  const controls = useAnimation();
  const ref = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const adjustedDuration = isMobile ? duration * 0.7 : duration;

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          controls.start('visible');
        }
      },
      { threshold, rootMargin: offset }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [controls, threshold, offset]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: adjustedDuration, ease: "easeOut" }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// 数字计数器动画
export interface CounterAnimationProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export const CounterAnimation: React.FC<CounterAnimationProps> = ({ 
  value, 
  duration = 1,
  prefix = '',
  suffix = '',
  className = '' 
}) => {
  const count = useAnimation();

  useEffect(() => {
    const animateCount = async () => {
      await count.start({
        value,
        transition: {
          duration,
          ease: "easeOut"
        }
      });
    };

    animateCount();
  }, [value, count, duration]);

  return (
    <motion.span
      initial={{ value: 0 }}
      animate={count}
      className={className}
    >
      {prefix}{count.get()?.toFixed(0)}{suffix}
    </motion.span>
  );
};

// 列表项动画容器
export interface AnimatedListProps {
  children: ReactNode;
  className?: string;
}

export const AnimatedList: React.FC<AnimatedListProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <motion.ul
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {children}
    </motion.ul>
  );
};

// 列表项动画
export interface AnimatedListItemProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export const AnimatedListItem: React.FC<AnimatedListItemProps> = ({ 
  children, 
  delay = 0,
  className = '' 
}) => {
  return (
    <motion.li
      variants={fadeIn}
      custom={delay}
      className={className}
    >
      {children}
    </motion.li>
  );
};

// 淡入淡出容器
export interface FadeInOutContainerProps {
  children: ReactNode;
  key: string | number;
  duration?: number;
  className?: string;
}

export const FadeInOutContainer: React.FC<FadeInOutContainerProps> = ({ 
  children, 
  key,
  duration = 0.3,
  className = '' 
}) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={key}
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { duration } },
          exit: { opacity: 0, transition: { duration } }
        }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};