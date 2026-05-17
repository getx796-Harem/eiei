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
        whileHover={hover ? { y: -5 } : {}}
        className={clsx(
          'rounded-xl border border-[var(--color-border)]',
          'bg-[var(--color-bg-primary)] p-6',
          'transition-all duration-300',
          'shadow-md hover:shadow-xl',
          gradient &&
            'bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] text-white border-0',
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