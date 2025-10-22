import * as React from 'react';

const CANDIDATES = [
  '/logo_tdf_records.svg',
  '/tdf-logo.svg',
  '/logo-tdf-records.svg',
  '/logo.svg',
];

export function Logo(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [index, setIndex] = React.useState(0);
  const src = CANDIDATES[index] ?? CANDIDATES[CANDIDATES.length - 1];

  return (
    <img
      alt={props.alt ?? 'TDF Records'}
      {...props}
      src={src}
      onError={() => setIndex((i) => Math.min(i + 1, CANDIDATES.length - 1))}
      style={{ maxHeight: 56, objectFit: 'contain', ...(props.style || {}) }}
    />
  );
}
