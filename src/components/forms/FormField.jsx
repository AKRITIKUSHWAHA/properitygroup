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
        <label htmlFor={id} className="form-label" style={{ color: '#0F172A', fontWeight: 700 }}>
          <span>{label}</span>
          {required ? (
            <span className="form-required-badge" aria-label="Required field" style={{ color: '#DC2626', fontWeight: 700 }}>* Required</span>
          ) : (
            <span className="form-optional-badge" style={{ fontSize: 'var(--font-size-xs)', color: '#475569', fontWeight: 600 }}>Optional</span>
          )}
        </label>
      )}

      {children}

      {helpText && !error && (
        <span className="form-help-text" id={`${id}-help`} style={{ color: '#475569', fontWeight: 500 }}>
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

