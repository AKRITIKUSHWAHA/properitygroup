import React from 'react';
import { AlertCircle } from 'lucide-react';

export function FormField({
  id,
  label,
  required = false,
  error,
  helpText,
  children
}) {
  return (
    <div className="form-group">
      {label && (
        <label htmlFor={id} className="form-label">
          <span>{label}</span>
          {required ? (
            <span className="form-required-badge" aria-label="Required field">* Required</span>
          ) : (
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-light-text)', fontWeight: 'normal' }}>Optional</span>
          )}
        </label>
      )}

      {children}

      {helpText && !error && (
        <span className="form-help-text" id={`${id}-help`}>
          {helpText}
        </span>
      )}

      {error && (
        <div className="form-error-msg" id={`${id}-error`} role="alert">
          <AlertCircle size={14} aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

