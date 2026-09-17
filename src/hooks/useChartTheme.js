import { useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const LIGHT_FALLBACK = {
  tick: '#334155',
  muted: '#64748b',
  grid: '#e2e8f0',
  axis: '#cbd5e1',
  tooltipBg: '#ffffff',
  tooltipBorder: '#e2e8f0',
  tooltipText: '#0f172a',
};

const DARK_FALLBACK = {
  tick: '#e2e8f0',
  muted: '#cbd5e1',
  grid: '#334155',
  axis: '#64748b',
  tooltipBg: '#0f172a',
  tooltipBorder: '#334155',
  tooltipText: '#f1f5f9',
};

function readCssVar(name, fallback) {
  if (typeof window === 'undefined') return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

function readChartColors(isDark) {
  const fallback = isDark ? DARK_FALLBACK : LIGHT_FALLBACK;
  return {
    tick: readCssVar('--chart-tick', fallback.tick),
    muted: readCssVar('--chart-muted', fallback.muted),
    grid: readCssVar('--chart-grid', fallback.grid),
    axis: readCssVar('--chart-axis', fallback.axis),
    tooltipBg: readCssVar('--chart-tooltip-bg', fallback.tooltipBg),
    tooltipBorder: readCssVar('--chart-tooltip-border', fallback.tooltipBorder),
    tooltipText: readCssVar('--chart-tooltip-text', fallback.tooltipText),
  };
}

/**
 * Recharts colors that follow the current light/dark theme tokens.
 */
export function useChartTheme() {
  const { isDark } = useTheme();
  const [colors, setColors] = useState(() => readChartColors(isDark));

  useEffect(() => {
    setColors(readChartColors(isDark));
  }, [isDark]);

  return {
    ...colors,
    isDark,
    tooltipStyle: {
      direction: 'rtl',
      borderRadius: 12,
      border: `1px solid ${colors.tooltipBorder}`,
      backgroundColor: colors.tooltipBg,
      color: colors.tooltipText,
      fontFamily: 'Cairo, Tajawal, system-ui',
    },
  };
}
