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
    gap: '0.35rem',
    fontSize: 'var(--font-size-xs, 0.75rem)',
    fontWeight: 'var(--font-weight-bold, 700)',
    padding: '0.3rem 0.75rem',
    borderRadius: 'var(--radius-pill, 9999px)',
    lineHeight: 1.2,
    letterSpacing: '0.04em',
    textTransform: 'uppercase'
  };

  const variantStyles = {
    default: {
      backgroundColor: '#0A1624',
      color: '#FFFFFF',
      border: '1px solid rgba(255, 255, 255, 0.28)'
    },
    navy: {
      backgroundColor: 'var(--color-primary-navy, #142A43)',
      color: '#FFFFFF',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    },
    gold: {
      backgroundColor: 'rgba(255, 255, 255, 0.16)',
      color: '#FFFFFF',
      border: '1px solid rgba(255, 255, 255, 0.35)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)'
    },
    success: {
      backgroundColor: 'var(--color-success-bg, #F0FDF4)',
      color: 'var(--color-success, #15803D)',
      border: '1px solid var(--color-success-border, #BBF7D0)'
    }
  };

  return (
    <span style={{ ...styles, ...(variantStyles[variant] || variantStyles.default) }} className={`badge badge-${variant} ${className}`.trim()}>
      {children}
    </span>
  );
}

