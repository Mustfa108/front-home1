import {
  Radar,
  RadarChart as ReRadar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { PILLAR_LABELS_AR, PILLAR_LABELS_EN } from '../../utils/constants';
import { pillarLabel } from '../../utils/locale';
import { useChartTheme } from '../../hooks/useChartTheme';

export function PillarRadarChart({
  data = [],
  height = 320,
  fillColor = '#1f3ff5',
  strokeColor = '#1f3ff5',
  showLabels = true,
  locale = 'ar',
}) {
  const chartTheme = useChartTheme();
  const labels = locale === 'en' ? PILLAR_LABELS_EN : PILLAR_LABELS_AR;
  const chartData = data.map((d) => ({
    pillar: pillarLabel(d, locale) || labels[d.pillar_key] || d.pillar_key,
    value: Number(d.percentage) || 0,
  }));

  return (
    <div style={{ width: '100%', height }} dir="ltr">
      <ResponsiveContainer>
        <ReRadar data={chartData} outerRadius="75%">
          <PolarGrid stroke={chartTheme.grid} />
          {showLabels && (
            <PolarAngleAxis
              dataKey="pillar"
              tick={{ fill: chartTheme.tick, fontSize: 12, fontWeight: 500 }}
            />
          )}
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: chartTheme.muted, fontSize: 10 }}
            stroke={chartTheme.axis}
          />
          <Tooltip
            contentStyle={chartTheme.tooltipStyle}
            formatter={(value) => [`${value}%`, 'النسبة']}
          />
          <Radar
            name="النسبة"
            dataKey="value"
            stroke={strokeColor}
            fill={fillColor}
            fillOpacity={chartTheme.isDark ? 0.45 : 0.35}
            isAnimationActive
          />
        </ReRadar>
      </ResponsiveContainer>
    </div>
  );
}
