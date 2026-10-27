import React from 'react';

export function Container({ children, isNarrow = false, className = '', as: Component = 'div', ...props }) {
  const containerClass = isNarrow ? 'container-narrow' : 'container';
  return (
    <Component className={`${containerClass} ${className}`.trim()} {...props}>
      {children}
    </Component>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'center', // 'center' | 'left'
  eyebrowVariant = 'default', // 'default' | 'gold'
  className = ''
}) {
  const eyebrowClass = eyebrowVariant === 'gold' ? 'section-eyebrow section-eyebrow-gold' : 'section-eyebrow';
  const wrapperStyle = align === 'left' ? { textAlign: 'left', marginLeft: 0, marginRight: 'auto' } : {};

  return (
    <div className={`section-heading-wrapper ${className}`.trim()} style={wrapperStyle}>
      {eyebrow && <span className={eyebrowClass}>{eyebrow}</span>}
      {title && <h2 className="section-heading-title">{title}</h2>}
      {subtitle && <p className="section-heading-subtitle">{subtitle}</p>}
    </div>
  );
}

export function Badge({ children, variant = 'default', className = '' }) {
  const styles = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    fontSize: 'var(--font-size-xs)',
    fontWeight: 'var(--font-weight-semibold)',
    padding: '0.25rem 0.625rem',
    borderRadius: 'var(--radius-pill)',
    lineHeight: 1
  };

  const variantStyles = {
    default: {
      backgroundColor: 'var(--color-light-grey-alt)',
      color: 'var(--color-primary-navy)',
      border: '1px solid var(--color-border-subtle)'
    },
    navy: {
      backgroundColor: 'var(--color-primary-navy)',
      color: 'var(--color-white)'
    },
    gold: {
      backgroundColor: 'var(--color-accent-gold-soft)',
      color: 'var(--color-primary-dark)',
      border: '1px solid rgba(197, 155, 39, 0.3)'
    },
    success: {
      backgroundColor: 'var(--color-success-bg)',
      color: 'var(--color-success)',
      border: '1px solid var(--color-success-border)'
    }
  };

  return (
    <span style={{ ...styles, ...(variantStyles[variant] || variantStyles.default) }} className={className}>
      {children}
    </span>
  );
}

