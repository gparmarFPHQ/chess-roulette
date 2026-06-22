/**
 * LineChart — Recharts-based line chart for exhibit data.
 */

import { useMemo } from 'react';
import { LineChart as ReLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { ExhibitData } from '../../types';

export interface LineChartProps {
  data: ExhibitData;
  width?: number;
  height?: number;
}

const DEFAULT_COLORS = ['#8B1A4A', '#C2185B', '#D4A843', '#4682B4', '#2A9D8F'];

export function LineChart({ data, width, height = 400 }: LineChartProps) {
  const chartData = useMemo(() => {
    const xKey = data.xKey || data.columns[0];
    const yKeys = data.yKeys || data.columns.slice(1);
    return data.rows.map((row) => {
      const entry: Record<string, string | number> = { [xKey]: row[xKey] };
      yKeys.forEach((key) => {
        entry[key] = row[key] ?? 0;
      });
      return entry;
    });
  }, [data]);

  const xKey = data.xKey || data.columns[0];
  const yKeys = data.yKeys || data.columns.slice(1);
  const colors = data.colors || DEFAULT_COLORS;

  return (
    <div className="exhibit-chart" style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ReLineChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey={xKey} tick={{ fontSize: 12 }} stroke="#6b7280" />
          <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              fontSize: 13,
            }}
            labelStyle={{ fontWeight: 600, color: '#8B1A4A', marginBottom: 4 }}
          />
          <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
          {yKeys.map((key, idx) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={colors[idx % colors.length]}
              strokeWidth={2.5}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 6 }}
              name={key}
            />
          ))}
        </ReLineChart>
      </ResponsiveContainer>
    </div>
  );
}
