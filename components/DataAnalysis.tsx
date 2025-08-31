"use client";

import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, TrendingDown, Package, DollarSign, ShoppingCart, Warehouse } from "lucide-react";

// Define the KPI data structure for each product
export interface ProductKPI {
  productId: number;
  productName: string;
  productCode: string;
  totalRevenue: number;
  totalCost: number;
  totalUnitsSold: number;
  totalUnitsProcured: number;
  averageSellingPrice: number;
  averageProcurementPrice: number;
  endingInventory: number;
  netAmount: number;
  sellThroughRate: number; // percentage
}

interface DataAnalysisProps {
  productKPIs: ProductKPI[];
}

export function DataAnalysis({ productKPIs }: DataAnalysisProps) {
  if (productKPIs.length === 0) {
    return null;
  }

  // Format currency values
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Format number with commas
  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  // Single product view - KPI Cards
  if (productKPIs.length === 1) {
    const kpi = productKPIs[0];
    
    // Compact stat card factory to reduce vertical whitespace
    const StatCard = ({
      label,
      value,
      icon,
      tone = "primary",
    }: {
      label: string
      value: string
      icon: ReactNode
      tone?: "primary" | "muted" | "positive" | "negative"
    }) => (
      <Card className="py-3 border-border shadow-sm">
        <CardContent className="px-4">
          <div className="flex items-center gap-2">
            <div
              className={
                "rounded-md p-1.5 " +
                (tone === "negative"
                  ? "bg-destructive/10"
                  : tone === "positive"
                  ? "bg-emerald-500/10"
                  : tone === "muted"
                  ? "bg-accent/20"
                  : "bg-primary/10")
              }
            >
              {icon}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground truncate">{label}</p>
              <p className="text-base font-semibold text-foreground leading-tight">{value}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )

    return (
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-foreground">Key Performance Indicators</h3>
        {/* Auto-fitting compact grid to avoid oversized cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
          <StatCard
            label="Total Revenue"
            value={formatCurrency(kpi.totalRevenue)}
            icon={<DollarSign className="h-4 w-4 text-primary" />}
            tone="primary"
          />
          <StatCard
            label="Units Sold"
            value={formatNumber(kpi.totalUnitsSold)}
            icon={<ShoppingCart className="h-4 w-4 text-primary" />}
            tone="primary"
          />
          <StatCard
            label="Total Cost"
            value={formatCurrency(kpi.totalCost)}
            icon={<Package className="h-4 w-4 text-muted-foreground" />}
            tone="muted"
          />
          <StatCard
            label="Ending Inventory"
            value={formatNumber(kpi.endingInventory)}
            icon={<Warehouse className="h-4 w-4 text-muted-foreground" />}
            tone="muted"
          />
          <StatCard
            label="Net Amount"
            value={formatCurrency(kpi.netAmount)}
            icon={
              kpi.netAmount >= 0 ? (
                <TrendingUp className="h-4 w-4 text-primary" />
              ) : (
                <TrendingDown className="h-4 w-4 text-destructive" />
              )
            }
            tone={kpi.netAmount >= 0 ? "positive" : "negative"}
          />
          <StatCard
            label="Avg. Selling Price"
            value={formatCurrency(kpi.averageSellingPrice)}
            icon={<DollarSign className="h-4 w-4 text-primary" />}
            tone="primary"
          />
          <StatCard
            label="Sell-Through Rate"
            value={formatPercentage(kpi.sellThroughRate)}
            icon={<TrendingUp className="h-4 w-4 text-primary" />}
            tone="primary"
          />
        </div>
      </div>
    );
  }

  // Multiple products view - Comparison Table
  return (
    <div className="space-y-3">
      <h3 className="text-base font-semibold text-foreground">Product Comparison</h3>
      <Card className="border-border shadow-sm py-0">
        <CardContent className="px-3 md:px-4 py-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold h-8 px-3">Product</TableHead>
                <TableHead className="text-right font-semibold h-8 px-3">Revenue</TableHead>
                <TableHead className="text-right font-semibold h-8 px-3">Units Sold</TableHead>
                <TableHead className="text-right font-semibold h-8 px-3">Avg. Price</TableHead>
                <TableHead className="text-right font-semibold h-8 px-3">Inventory</TableHead>
                <TableHead className="text-right font-semibold h-8 px-3">Net Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productKPIs.map((kpi) => (
                <TableRow key={kpi.productId} className="hover:bg-accent/20 odd:bg-accent/5">
                  <TableCell className="px-3 py-2 font-medium">
                    <div>
                      <div className="font-semibold text-foreground">{kpi.productName}</div>
                      <div className="text-xs text-muted-foreground">{kpi.productCode}</div>
                    </div>
                  </TableCell>
                  <TableCell className="px-3 py-2 text-right font-semibold text-foreground">
                    {formatCurrency(kpi.totalRevenue)}
                  </TableCell>
                  <TableCell className="px-3 py-2 text-right">
                    {formatNumber(kpi.totalUnitsSold)}
                  </TableCell>
                  <TableCell className="px-3 py-2 text-right">
                    {formatCurrency(kpi.averageSellingPrice)}
                  </TableCell>
                  <TableCell className="px-3 py-2 text-right">
                    {formatNumber(kpi.endingInventory)}
                  </TableCell>
                  <TableCell className={`px-3 py-2 text-right font-semibold ${kpi.netAmount >= 0 ? 'text-primary' : 'text-destructive'}`}>
                    {formatCurrency(kpi.netAmount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
