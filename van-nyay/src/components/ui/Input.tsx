import React, { useId } from 'react';
import './Input.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, leftIcon, id, ...props }, ref) => {
    const defaultId = useId();
    const inputId = id || defaultId;

    return (
      <div className="input-wrapper">
        {label && (
          <label htmlFor={inputId} className="input-label">
            {label}
          </label>
        )}
        <div className="input-container">
          {leftIcon && <span className="input-icon">{leftIcon}</span>}
          <input
            ref={ref}
            id={inputId}
            className={`input ${leftIcon ? 'input-with-icon' : ''} ${error ? 'input-error' : ''} ${className}`}
            {...props}
          />
        </div>
        {error && <span className="input-error-msg">{error}</span>}
      </div>
    );
  }
);
Input.displayName = 'Input';
