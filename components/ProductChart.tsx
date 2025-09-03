"use client";

import React, { type CSSProperties } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export interface ChartDataPoint {
  date: string;
  inventory: number;
  procurementAmount: number;
  salesAmount: number;
  recordDate: string;
}

export interface ProductSeries {
  productId: number;
  productName: string;
  productCode: string;
  data: ChartDataPoint[];
}

interface EnabledCurves {
  inventory: boolean;
  procurement: boolean;
  sales: boolean;
}

interface ProductChartProps {
  productSeries: ProductSeries[];
  enabledCurves: EnabledCurves;
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

// Color palette for different products using CSS variables
const PRODUCT_COLORS = [
  'var(--chart-1)', // Chart primary
  'var(--primary)', // Chart secondary
  'oklch(0.5778 0.0759 150.1573)', // Chart tertiary
  'oklch(0.1778 0.7759 52.1573)', // Destructive color
  'var(--secondary-foreground)', // Muted foreground
];

export function ProductChart({ productSeries, enabledCurves }: ProductChartProps) {
  if (!productSeries || productSeries.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <p>No data available for chart</p>
      </div>
    );
  }

  // Combine all data points for unified date axis
  const dateMap = new Map<string, string>(); // Map from display date to recordDate
  productSeries.forEach(series => {
    series.data.forEach(point => {
      dateMap.set(point.date, point.recordDate);
    });
  });

  // Sort by actual record dates to handle multi-year data correctly
  const sortedDates = Array.from(dateMap.keys()).sort((a, b) => {
    const recordDateA = dateMap.get(a);
    const recordDateB = dateMap.get(b);
    if (recordDateA && recordDateB) {
      return new Date(recordDateA).getTime() - new Date(recordDateB).getTime();
    }
    // Fallback to string comparison if recordDate is missing
    return a.localeCompare(b);
  });

  // Create unified data structure for the chart
  const unifiedData = sortedDates.map(date => {
    const dataPoint: Record<string, string | number | null> = { date };
    
    productSeries.forEach((series) => {
      const point = series.data.find(d => d.date === date);
      if (point) {
        dataPoint[`${series.productCode}_inventory`] = point.inventory;
        dataPoint[`${series.productCode}_procurement`] = point.procurementAmount;
        dataPoint[`${series.productCode}_sales`] = point.salesAmount;
      } else {
        // Fill missing data with null
        dataPoint[`${series.productCode}_inventory`] = null;
        dataPoint[`${series.productCode}_procurement`] = null;
        dataPoint[`${series.productCode}_sales`] = null;
      }
    });
    
    return dataPoint;
  });

  // Find the maximum values for better Y-axis scaling
  const allValues: number[] = [];
  productSeries.forEach(series => {
    series.data.forEach(point => {
      if (enabledCurves.inventory) allValues.push(point.inventory);
      if (enabledCurves.procurement) allValues.push(point.procurementAmount);
      if (enabledCurves.sales) allValues.push(point.salesAmount);
    });
  });
  
  const maxValue = allValues.length > 0 ? Math.max(...allValues) : 1000;

  // Helper for legend line styles matching the chart strokes
  const lineSampleStyle = (color: string, variant: 'solid' | 'dashed' | 'dashdot') => {
    const base: CSSProperties = {
      display: 'inline-block',
      width: 24,
      height: 2,
      borderRadius: 9999,
    };
    if (variant === 'solid') {
      return { ...base, backgroundColor: color };
    }
    if (variant === 'dashed') {
      return {
        ...base,
        backgroundImage: `repeating-linear-gradient(90deg, ${color}, ${color} 8px, transparent 8px, transparent 12px)`,
      } as CSSProperties;
    }
    // dash-dot approximation
    return {
      ...base,
      backgroundImage: `repeating-linear-gradient(90deg, ${color}, ${color} 10px, transparent 10px, transparent 13px, ${color} 13px, ${color} 15px, transparent 15px, transparent 18px)`,
    } as CSSProperties;
  };

  const LegendItem = ({ label, color, variant }: { label: string; color: string; variant: 'solid' | 'dashed' | 'dashdot' }) => (
    <div className="flex items-center gap-1 text-[11px] leading-4">
      <span style={lineSampleStyle(color, variant)} />
      <span className="truncate">{label}</span>
    </div>
  );

  return (
    <div className="w-full">
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={unifiedData}
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
              domain={[0, maxValue * 1.1]}
              tickFormatter={(value) => {
                if (value >= 1000000) {
                  return `${(value / 1000000).toFixed(1)}M`;
                } else if (value >= 1000) {
                  return `${(value / 1000).toFixed(1)}K`;
                }
                return value.toLocaleString();
              }}
            />
            <Tooltip content={<CustomTooltip />} wrapperStyle={{ zIndex: 50 }} />

            {/* Generate lines for each product and curve combination */}
            {productSeries.map((series, seriesIndex) => {
              const baseColor = PRODUCT_COLORS[seriesIndex % PRODUCT_COLORS.length];
              const lines = [] as React.ReactElement[];
              
              // Inventory Line
              if (enabledCurves.inventory) {
                lines.push(
                  <Line
                    key={`${series.productCode}_inventory`}
                    type="monotone"
                    dataKey={`${series.productCode}_inventory`}
                    stroke={baseColor}
                    strokeWidth={2}
                    strokeDasharray="10 3 3 3" // Changed to dash-dot line
                    dot={{ fill: baseColor, strokeWidth: 2, r: 3 }}
                    activeDot={{ r: 5, stroke: baseColor, strokeWidth: 2 }}
                    name={`${series.productName} - Inventory`}
                    connectNulls
                  />
                );
              }
              
              // Procurement Line  
              if (enabledCurves.procurement) {
                lines.push(
                  <Line
                    key={`${series.productCode}_procurement`}
                    type="monotone"
                    dataKey={`${series.productCode}_procurement`}
                    stroke={baseColor}
                    strokeWidth={2}
                    strokeDasharray="5 5" // Dashed line
                    dot={{ fill: baseColor, strokeWidth: 2, r: 3 }}
                    activeDot={{ r: 5, stroke: baseColor, strokeWidth: 2 }}
                    name={`${series.productName} - Procurement`}
                    connectNulls
                  />
                );
              }
              
              // Sales Line
              if (enabledCurves.sales) {
                lines.push(
                  <Line
                    key={`${series.productCode}_sales`}
                    type="monotone"
                    dataKey={`${series.productCode}_sales`}
                    stroke={baseColor}
                    strokeWidth={2}
                    strokeDasharray="0" // Changed to solid line
                    dot={{ fill: baseColor, strokeWidth: 2, r: 3 }}
                    activeDot={{ r: 5, stroke: baseColor, strokeWidth: 2 }}
                    name={`${series.productName} - Sales`}
                    connectNulls
                  />
                );
              }
              
              return lines;
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Compact grouped legend below the chart */}
      <div className="mt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {productSeries.map((series, seriesIndex) => {
            const baseColor = PRODUCT_COLORS[seriesIndex % PRODUCT_COLORS.length];
            return (
              <div key={series.productId} className="rounded-md border border-border/50 bg-muted/30 p-2">
                <div className="flex items-baseline justify-between">
                  <div className="text-xs font-semibold truncate pr-2">{series.productName}</div>
                  <div className="text-[10px] text-muted-foreground truncate">{series.productCode}</div>
                </div>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
                  {enabledCurves.inventory && (
                    <LegendItem label="Inventory" color={baseColor} variant="dashdot" />
                  )}
                  {enabledCurves.procurement && (
                    <LegendItem label="Procurement" color={baseColor} variant="dashed" />
                  )}
                  {enabledCurves.sales && (
                    <LegendItem label="Sales" color={baseColor} variant="solid" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
