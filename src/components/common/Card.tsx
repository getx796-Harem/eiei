import React from 'react';
import { motion } from 'motion/react';
import clsx from 'clsx';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  gradient?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ hover = true, gradient = false, className, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        whileHover={hover ? { y: -5, scale: 1.02 } : {}}
        className={clsx(
          'rounded-2xl border',
          'p-6 transition-all duration-300',
          'shadow-lg hover:shadow-2xl',
          gradient
            ? 'bg-gradient-to-br from-indigo-500 to-purple-500 border-0 text-white'
            : 'bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] border-[var(--color-border)]',
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = 'Card';

export default Card;