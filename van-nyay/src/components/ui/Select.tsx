import React, { useId } from 'react';
import './Select.css';

interface Option {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Option[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', label, error, options, id, ...props }, ref) => {
    const defaultId = useId();
    const selectId = id || defaultId;

    return (
      <div className="select-wrapper">
        {label && (
          <label htmlFor={selectId} className="select-label">
            {label}
          </label>
        )}
        <div className="select-container">
          <select
            ref={ref}
            id={selectId}
            className={`select ${error ? 'select-error' : ''} ${className}`}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {/* Custom arrow for styling */}
          <div className="select-arrow">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </div>
        </div>
        {error && <span className="select-error-msg">{error}</span>}
      </div>
    );
  }
);
Select.displayName = 'Select';
