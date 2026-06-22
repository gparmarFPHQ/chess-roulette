/**
 * PieChart — Recharts-based pie chart for exhibit data.
 */

import { useMemo } from 'react';
import { PieChart as RePieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { ExhibitData } from '../../types';

export interface PieChartProps {
  data: ExhibitData;
  width?: number;
  height?: number;
}

const DEFAULT_COLORS = ['#8B1A4A', '#C2185B', '#D4A843', '#4682B4', '#2A9D8F', '#6B7280', '#9CA3AF'];

export function PieChart({ data, width, height = 400 }: PieChartProps) {
  const chartData = useMemo(() => {
    const nameKey = data.xKey || data.columns[0];
    const valueKey = data.yKeys?.[0] || data.columns[1];
    return data.rows.map((row) => ({
      name: row[nameKey],
      value: row[valueKey] ?? 0,
    }));
  }, [data]);

  const colors = data.colors || DEFAULT_COLORS;

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return percent > 0.03 ? (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
        {(percent * 100).toFixed(1)}%
      </text>
    ) : null;
  };

  return (
    <div className="exhibit-chart" style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RePieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={Math.min(height, 400) * 0.35}
            innerRadius={Math.min(height, 400) * 0.15}
            dataKey="value"
            nameKey="name"
          >
            {chartData.map((_entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} stroke="#fff" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => value.toLocaleString()}
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              fontSize: 13,
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
            formatter={(value, entry) => {
              const item = chartData.find((d) => d.name === value);
              return item ? `${value} (${item.value.toLocaleString()})` : value;
            }}
          />
        </RePieChart>
      </ResponsiveContainer>
    </div>
  );
}
