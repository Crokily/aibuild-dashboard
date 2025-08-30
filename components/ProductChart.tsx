"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export interface ChartDataPoint {
  date: string;
  inventory: number;
  procurementAmount: number;
  salesAmount: number;
  recordDate: string;
}

interface ProductChartProps {
  data: ChartDataPoint[];
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    color: string;
    name: string;
    value: number;
    dataKey: string;
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg shadow-lg p-3">
        <p className="font-medium text-card-foreground mb-2">{`Date: ${label}`}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {`${entry.name}: ${
              entry.dataKey === 'inventory' 
                ? entry.value.toLocaleString() + ' units'
                : '$' + entry.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            }`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function ProductChart({ data }: ProductChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <p>No data available for chart</p>
      </div>
    );
  }

  // Find the maximum values for better Y-axis scaling
  const maxInventory = Math.max(...data.map(d => d.inventory));
  const maxAmount = Math.max(
    ...data.map(d => Math.max(d.procurementAmount, d.salesAmount))
  );

  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="date" 
            className="text-xs"
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            className="text-xs"
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => {
              if (value >= 1000000) {
                return `${(value / 1000000).toFixed(1)}M`;
              } else if (value >= 1000) {
                return `${(value / 1000).toFixed(1)}K`;
              }
              return value.toLocaleString();
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="line"
          />
          
          {/* Inventory Line - Blue */}
          <Line
            type="monotone"
            dataKey="inventory"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: "hsl(var(--primary))", strokeWidth: 2 }}
            name="Inventory (Units)"
          />
          
          {/* Procurement Amount Line - Green */}
          <Line
            type="monotone"
            dataKey="procurementAmount"
            stroke="hsl(142 76% 36%)"
            strokeWidth={2}
            dot={{ fill: "hsl(142 76% 36%)", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: "hsl(142 76% 36%)", strokeWidth: 2 }}
            name="Procurement Amount ($)"
          />
          
          {/* Sales Amount Line - Orange */}
          <Line
            type="monotone"
            dataKey="salesAmount"
            stroke="hsl(25 95% 53%)"
            strokeWidth={2}
            dot={{ fill: "hsl(25 95% 53%)", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: "hsl(25 95% 53%)", strokeWidth: 2 }}
            name="Sales Amount ($)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
