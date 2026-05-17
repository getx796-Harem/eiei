import React from 'react';
import { motion } from 'motion/react';
import clsx from 'clsx';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      icon,
      fullWidth = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'btn-base font-bold rounded-xl transition-all duration-200';

    const variants = {
      primary:
        'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:shadow-xl hover:scale-105 active:scale-95',
      secondary:
        'bg-white/10 text-white border-2 border-white/20 hover:bg-white/20 hover:border-white/40',
      danger:
        'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:shadow-xl hover:scale-105',
      success:
        'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-xl hover:scale-105',
      ghost:
        'bg-transparent text-white hover:bg-white/10 border-2 border-transparent hover:border-white/20',
    };

    const sizes = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-5 py-2.5 text-base',
      lg: 'px-6 py-3.5 text-lg',
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={clsx(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity }}
            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
          />
        ) : (
          icon
        )}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export default Button;