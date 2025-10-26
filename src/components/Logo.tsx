import * as React from 'react';
import { useColorMode } from '../theme/ColorModeProvider';

const FALLBACK_CANDIDATES = [
  '/logo_tdf_records.svg',
  '/tdf-logo.svg',
  '/logo-tdf-records.svg',
  '/logo.svg',
];

const THEMED_SOURCES = {
  light: '/assets/tdf-ui/tdf_logo_black.svg',
  dark: '/assets/tdf-ui/tdf_logo_white.svg',
} as const;

export function Logo({ style, alt, onError, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) {
  const { mode } = useColorMode();
  const themedSource = THEMED_SOURCES[mode] ?? THEMED_SOURCES.light;
  const candidates = React.useMemo(() => {
    const fallbacks = FALLBACK_CANDIDATES.filter((candidate) => candidate !== themedSource);
    return [themedSource, ...fallbacks];
  }, [themedSource]);

  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    setIndex(0);
  }, [themedSource]);

  const src = candidates[index] ?? themedSource;

  return (
    <img
      {...props}
      alt={alt ?? 'TDF Records'}
      src={src}
      onError={(event) => {
        setIndex((i) => Math.min(i + 1, candidates.length - 1));
        onError?.(event);
      }}
      style={{ maxHeight: 56, objectFit: 'contain', ...(style || {}) }}
    />
  );
}
