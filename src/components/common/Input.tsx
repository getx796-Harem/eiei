import React from 'react';
import { motion } from 'motion/react';
import clsx from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, helperText, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold text-white mb-2 ml-1">
            {label}
          </label>
        )}
        <motion.div
          whileFocus="focus"
          className={clsx(
            'relative flex items-center',
            'border-2 border-white/20 rounded-xl bg-white/10',
            'focus-within:border-indigo-400 focus-within:bg-white/15 focus-within:shadow-lg',
            'transition-all duration-200 backdrop-blur-sm',
            error && 'border-red-400/50 bg-red-500/5'
          )}
        >
          {icon && (
            <span className="absolute left-4 text-white/60">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            className={clsx(
              'w-full px-4 py-3 bg-transparent outline-none',
              'text-white placeholder-white/40',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              icon && 'pl-12',
              className
            )}
            {...props}
          />
        </motion.div>
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-2 text-sm text-red-300 ml-1"
          >
            {error}
          </motion.p>
        )}
        {helperText && !error && (
          <p className="mt-2 text-sm text-white/60 ml-1">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;