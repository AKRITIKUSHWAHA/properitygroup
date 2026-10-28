import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Reusable Accessible Button Component
 */
export function Button({
  children,
  to,
  href,
  onClick,
  variant = 'primary', // 'primary' | 'secondary' | 'gold' | 'outline-white'
  size = 'md',        // 'sm' | 'md' | 'lg'
  isBlock = false,
  type = 'button',
  disabled = false,
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  ariaLabel,
  ...rest
}) {
  const sizeClass = size === 'lg' ? 'btn-lg' : size === 'sm' ? 'btn-sm' : '';
  const variantClass = `btn-${variant}`;
  const blockClass = isBlock ? 'btn-block' : '';
  const fullClassName = `btn ${variantClass} ${sizeClass} ${blockClass} ${className}`.trim();

  const content = (
    <>
      {loading && (
        <span
          style={{
            display: 'inline-block',
            width: '1em',
            height: '1em',
            border: '2px solid currentColor',
            borderRightColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.6s linear infinite'
          }}
          aria-hidden="true"
        />
      )}
      {!loading && Icon && iconPosition === 'left' && <Icon size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} aria-hidden="true" />}
      <span>{children}</span>
      {!loading && Icon && iconPosition === 'right' && <Icon size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} aria-hidden="true" />}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={fullClassName} onClick={onClick} aria-label={ariaLabel} {...rest}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={fullClassName} onClick={onClick} aria-label={ariaLabel} {...rest}>
        {content}
      </a>
    );
  }

  return (
    <button
      type={type}
      className={fullClassName}
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      {...rest}
    >
      {content}
    </button>
  );
}

