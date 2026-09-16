import React from 'react';
import './Button.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', isLoading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    const classNames = `btn btn-${variant} btn-${size} ${isLoading ? 'btn-loading' : ''} ${className}`;

    return (
      <button
        ref={ref}
        className={classNames}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <span className="spinner"></span>}
        {!isLoading && leftIcon && <span className="btn-icon-left">{leftIcon}</span>}
        <span className="btn-content">{children}</span>
        {!isLoading && rightIcon && <span className="btn-icon-right">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
