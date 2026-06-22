/**
 * ChartRenderer — Dynamic chart component selector.
 *
 * Renders the appropriate chart component based on the exhibit's chartType.
 */

import { memo } from 'react';
import type { Exhibit } from './types';
import { BarChart, LineChart, PieChart, AreaChart } from './charts';

export interface ChartRendererProps {
  exhibit: Exhibit;
  width?: number;
  height?: number;
}

const ChartRenderer = memo(({ exhibit, width, height = 400 }: ChartRendererProps) => {
  if (!exhibit.data) {
    return (
      <div className="exhibit-chart__error" style={{ padding: 24, textAlign: 'center', color: '#6b7280' }}>
        No chart data available for this exhibit.
      </div>
    );
  }

  const chartProps = { data: exhibit.data, width, height };

  switch (exhibit.data.chartType) {
    case 'bar':
      return <BarChart {...chartProps} />;
    case 'line':
      return <LineChart {...chartProps} />;
    case 'pie':
      return <PieChart {...chartProps} />;
    case 'area':
      return <AreaChart {...chartProps} />;
    default:
      return (
        <div className="exhibit-chart__error" style={{ padding: 24, textAlign: 'center', color: '#6b7280' }}>
          Unknown chart type: {exhibit.data.chartType || 'none specified'}
        </div>
      );
  }
});

ChartRenderer.displayName = 'ChartRenderer';

export { ChartRenderer };
