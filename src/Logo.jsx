import React from 'react';

export default function Logo({ light = false, className = '' }) {
  return <img className={`heerim-logo${light ? ' heerim-logo-light' : ''} ${className}`} src={`${import.meta.env.BASE_URL}assets/heerim-logo.svg`} alt="희림건축 · Heerim Architects & Planners" />;
}
