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
  'var(--chart-2)', // Chart secondary
  'oklch(0.5778 0.0759 124.1573)', // Chart tertiary
  'oklch(0.1778 0.7759 52.1573)', // Destructive color
  'var(--chart-5)', // Muted foreground
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
  const allDates = new Set<string>();
  productSeries.forEach(series => {
    series.data.forEach(point => allDates.add(point.date));
  });
  
  const sortedDates = Array.from(allDates).sort((a, b) => {
    // Sort by date - need to convert back to compare properly
    const dateA = new Date(a + ', 2024'); // Add year for parsing
    const dateB = new Date(b + ', 2024');
    return dateA.getTime() - dateB.getTime();
  });

  // Create unified data structure for the chart
  const unifiedData = sortedDates.map(date => {
    const dataPoint: any = { date };
    
    productSeries.forEach((series, index) => {
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

  return (
    <div className="w-full h-96">
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
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="line"
          />
          
          {/* Generate lines for each product and curve combination */}
          {productSeries.map((series, seriesIndex) => {
            const baseColor = PRODUCT_COLORS[seriesIndex % PRODUCT_COLORS.length];
            const lines = [];
            
            // Inventory Line
            if (enabledCurves.inventory) {
              lines.push(
                <Line
                  key={`${series.productCode}_inventory`}
                  type="monotone"
                  dataKey={`${series.productCode}_inventory`}
                  stroke={baseColor}
                  strokeWidth={2}
                  strokeDasharray="0"
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
                  strokeDasharray="10 3 3 3" // Dash-dot line
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
  );
}
