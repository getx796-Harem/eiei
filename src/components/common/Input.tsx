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
          <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2">
            {label}
          </label>
        )}
        <motion.div
          className={clsx(
            'relative flex items-center',
            'border-2 border-[var(--color-border)] rounded-lg',
            'focus-within:border-[var(--color-primary)] focus-within:shadow-lg',
            'transition-all duration-200',
            error && 'border-[var(--color-danger)]'
          )}
        >
          {icon && (
            <span className="absolute left-3 text-[var(--color-text-secondary)]">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            className={clsx(
              'w-full px-4 py-2.5 bg-transparent outline-none',
              'text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)]',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              icon && 'pl-10',
              className
            )}
            {...props}
          />
        </motion.div>
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-1.5 text-sm text-[var(--color-danger)]"
          >
            {error}
          </motion.p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-[var(--color-text-tertiary)]">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
