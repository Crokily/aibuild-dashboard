"use client";

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
    
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Key Performance Indicators</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Revenue */}
          <Card className="border-border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <DollarSign className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-xl font-bold text-foreground">{formatCurrency(kpi.totalRevenue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Units Sold */}
          <Card className="border-border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <ShoppingCart className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Units Sold</p>
                  <p className="text-xl font-bold text-foreground">{formatNumber(kpi.totalUnitsSold)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Cost */}
          <Card className="border-border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-accent/20 rounded-lg">
                  <Package className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Total Cost</p>
                  <p className="text-xl font-bold text-foreground">{formatCurrency(kpi.totalCost)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ending Inventory */}
          <Card className="border-border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-accent/20 rounded-lg">
                  <Warehouse className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Ending Inventory</p>
                  <p className="text-xl font-bold text-foreground">{formatNumber(kpi.endingInventory)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional metrics in a second row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Net Amount */}
          <Card className="border-border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Net Amount</p>
                  <p className={`text-lg font-semibold ${kpi.netAmount >= 0 ? 'text-primary' : 'text-destructive'}`}>
                    {formatCurrency(kpi.netAmount)}
                  </p>
                </div>
                <div className="p-2 bg-accent/10 rounded-lg">
                  {kpi.netAmount >= 0 ? 
                    <TrendingUp className="h-4 w-4 text-primary" /> : 
                    <TrendingDown className="h-4 w-4 text-destructive" />
                  }
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Average Selling Price */}
          <Card className="border-border shadow-sm">
            <CardContent className="p-4">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Selling Price</p>
                <p className="text-lg font-semibold text-foreground">{formatCurrency(kpi.averageSellingPrice)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Sell-Through Rate */}
          <Card className="border-border shadow-sm">
            <CardContent className="p-4">
              <div>
                <p className="text-sm text-muted-foreground">Sell-Through Rate</p>
                <p className="text-lg font-semibold text-primary">{formatPercentage(kpi.sellThroughRate)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Multiple products view - Comparison Table
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Product Comparison</h3>
      <Card className="border-border shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">Product</TableHead>
                <TableHead className="text-right font-semibold">Revenue</TableHead>
                <TableHead className="text-right font-semibold">Units Sold</TableHead>
                <TableHead className="text-right font-semibold">Avg. Price</TableHead>
                <TableHead className="text-right font-semibold">Inventory</TableHead>
                <TableHead className="text-right font-semibold">Net Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productKPIs.map((kpi) => (
                <TableRow key={kpi.productId} className="hover:bg-accent/5">
                  <TableCell className="font-medium">
                    <div>
                      <div className="font-semibold text-foreground">{kpi.productName}</div>
                      <div className="text-sm text-muted-foreground">{kpi.productCode}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-semibold text-foreground">
                    {formatCurrency(kpi.totalRevenue)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatNumber(kpi.totalUnitsSold)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(kpi.averageSellingPrice)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatNumber(kpi.endingInventory)}
                  </TableCell>
                  <TableCell className={`text-right font-semibold ${kpi.netAmount >= 0 ? 'text-primary' : 'text-destructive'}`}>
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
