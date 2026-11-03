import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export function Breadcrumbs({ items = [] }) {
  if (!items || items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="breadcrumbs">
      <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
        <Home size={13} aria-hidden="true" />
        <span>Home</span>
      </Link>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={item.path || index}>
            <ChevronRight size={12} className="breadcrumb-separator" aria-hidden="true" />
            {isLast ? (
              <span className="breadcrumb-current" aria-current="page">
                {item.label}
              </span>
            ) : (
              <Link to={item.path}>{item.label}</Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

