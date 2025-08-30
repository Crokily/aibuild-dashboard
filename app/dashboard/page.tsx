import { db } from "@/lib/db";
import { products, dailyRecords } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { ProductSelector } from "../../components/ProductSelector";
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

  // Determine selected product ID from URL params
  const selectedProductId = params.productId
    ? parseInt(params.productId as string)
    : allProducts[0]?.id;

  let chartData: ChartDataPoint[] = [];
  let selectedProduct: Product | undefined;

  if (selectedProductId && allProducts.length > 0) {
    // Find the selected product
    selectedProduct = allProducts.find(p => p.id === selectedProductId);

    // Get daily records for the selected product
    const records = await db
      .select()
      .from(dailyRecords)
      .where(eq(dailyRecords.productId, selectedProductId))
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
          <Button asChild variant="outline">
            <Link href="/upload">
              <Upload className="w-4 h-4 mr-2" />
              Upload Data
            </Link>
          </Button>
        </div>

        {/* Product Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Product Selection</CardTitle>
            <CardDescription>
              Choose a product to view its procurement, sales, and inventory data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProductSelector 
              products={allProducts} 
              selectedProductId={selectedProductId}
            />
          </CardContent>
        </Card>

        {/* Chart */}
        {selectedProduct && chartData.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedProduct.name} ({selectedProduct.productCode})
              </CardTitle>
              <CardDescription>
                Daily trends showing inventory levels, procurement amounts, and sales amounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProductChart data={chartData} />
            </CardContent>
          </Card>
        ) : allProducts.length === 0 ? (
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
