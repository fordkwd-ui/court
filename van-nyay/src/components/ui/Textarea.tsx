import React, { useId } from 'react';
import './Textarea.css';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', label, error, id, ...props }, ref) => {
    const defaultId = useId();
    const textareaId = id || defaultId;

    return (
      <div className="textarea-wrapper">
        {label && (
          <label htmlFor={textareaId} className="textarea-label">
            {label}
          </label>
        )}
        <div className="textarea-container">
          <textarea
            ref={ref}
            id={textareaId}
            className={`textarea ${error ? 'textarea-error' : ''} ${className}`}
            {...props}
          />
        </div>
        {error && <span className="textarea-error-msg">{error}</span>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
