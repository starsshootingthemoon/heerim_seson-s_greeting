import React from 'react';

export default function ScenicSnow() {
  return <div className="scenic-snow" aria-hidden="true">{Array.from({ length: 24 }, (_, i) => <i key={i} style={{ left: `${(i * 43 + 11) % 100}%`, width: i % 6 === 0 ? 8 : 2, height: i % 6 === 0 ? 8 : 2, animationDuration: `${9 + i % 8}s`, animationDelay: `${-i * 1.3}s`, opacity: i % 6 === 0 ? .35 : .65 }} />)}</div>;
}
