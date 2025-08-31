import { db } from "@/lib/db";
import { products, dailyRecords } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { ChartCustomizer } from "../../components/ChartCustomizer";
import { ProductChart } from "../../components/ProductChart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import Link from "next/link";

// Define the type for chart data
export interface ChartDataPoint {
  date: string;
  inventory: number;
  procurementAmount: number;
  salesAmount: number;
  recordDate: string; // Raw date for sorting
}

export interface Product {
  id: number;
  productCode: string;
  name: string;
}

interface DashboardPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  // Await searchParams in Next.js 15
  const params = await searchParams;

  // Get all products for the selector
  const allProducts = await db.select().from(products).orderBy(asc(products.productCode));

  // Get selected product IDs from URL params (support multiple products)
  const selectedProductIds = params.products 
    ? (Array.isArray(params.products) ? params.products : [params.products])
        .map(id => parseInt(id as string))
        .filter(id => !isNaN(id))
    : [];

  let chartData: ChartDataPoint[] = [];
  let selectedProducts: Product[] = [];

  if (selectedProductIds.length > 0 && allProducts.length > 0) {
    // Find the selected products
    selectedProducts = allProducts.filter(p => selectedProductIds.includes(p.id));

    // For now, we'll show data for the first selected product to maintain compatibility
    // TODO: Update ProductChart to support multiple products
    const firstSelectedProductId = selectedProductIds[0];
    const firstSelectedProduct = selectedProducts[0];

    if (firstSelectedProduct) {
      // Get daily records for the first selected product
      const records = await db
        .select()
        .from(dailyRecords)
        .where(eq(dailyRecords.productId, firstSelectedProductId))
        .orderBy(asc(dailyRecords.recordDate));

      // Transform data for chart
      chartData = records.map(record => {
        const procurementAmount = record.procurementQty * parseFloat(record.procurementPrice);
        const salesAmount = record.salesQty * parseFloat(record.salesPrice);
        
        return {
          date: new Date(record.recordDate).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          }),
          inventory: record.closingInventory,
          procurementAmount,
          salesAmount,
          recordDate: record.recordDate,
        };
      });
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Analyze procurement, sales, and inventory trends for your products
            </p>
          </div>
          {/* Upload button removed; navigation available in top bar */}
        </div>

        {/* Chart Customization */}
        <ChartCustomizer 
          products={allProducts} 
          maxSelection={5}
        />

        {/* Chart */}
        {allProducts.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center space-y-3">
                <p className="text-lg font-medium text-muted-foreground">No Data Available</p>
                <p className="text-sm text-muted-foreground">
                  Please upload an Excel file to import product data first.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (Array.isArray(params.products) ? params.products.length : params.products ? 1 : 0) === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center space-y-3">
                <p className="text-lg font-medium text-muted-foreground">No Products Selected</p>
                <p className="text-sm text-muted-foreground">
                  Use the selector above to choose one or more products.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : selectedProducts.length > 0 && chartData.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedProducts.length === 1 
                  ? `${selectedProducts[0].name} (${selectedProducts[0].productCode})`
                  : `Comparison of ${selectedProducts.length} Products`
                }
              </CardTitle>
              <CardDescription>
                Daily trends showing inventory levels, procurement amounts, and sales amounts
                {selectedProducts.length > 1 && " (Currently showing first product - multi-product support coming soon)"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProductChart data={chartData} />
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center space-y-3">
                <p className="text-lg font-medium text-muted-foreground">No Records Found</p>
                <p className="text-sm text-muted-foreground">
                  No daily records found for the selected product.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
