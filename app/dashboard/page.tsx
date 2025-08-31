import { db } from "@/lib/db";
import { products, dailyRecords } from "@/lib/db/schema";
import { and, asc, gte, inArray, lte } from "drizzle-orm";
import { DashboardClientWrapper } from "../../components/DashboardClientWrapper";
import { resolveDateRange } from "@/lib/date-range";

// Define the type for chart data
export interface ChartDataPoint {
  date: string;
  inventory: number;
  procurementAmount: number;
  salesAmount: number;
  recordDate: string; // Raw date for sorting
}

// Define the type for multi-product chart data
export interface ProductSeries {
  productId: number;
  productName: string;
  productCode: string;
  data: ChartDataPoint[];
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

  // Date range params
  const rangeParam = (Array.isArray(params.range) ? params.range[0] : (params.range as string | undefined)) ?? null;
  const fromParam = (Array.isArray(params.from) ? params.from[0] : (params.from as string | undefined)) ?? null;
  const toParam = (Array.isArray(params.to) ? params.to[0] : (params.to as string | undefined)) ?? null;
  const resolvedRange = resolveDateRange({ range: rangeParam, from: fromParam, to: toParam });

  let productSeries: ProductSeries[] = [];
  let selectedProducts: Product[] = [];

  if (selectedProductIds.length > 0 && allProducts.length > 0) {
    // Find the selected products
    selectedProducts = allProducts.filter(p => selectedProductIds.includes(p.id));

    // Get daily records for ALL selected products at once
    // Build where clause with optional date range
    const conditions = [inArray(dailyRecords.productId, selectedProductIds)];
    if (resolvedRange.key !== 'all') {
      if (resolvedRange.from) conditions.push(gte(dailyRecords.recordDate, resolvedRange.from));
      if (resolvedRange.to) conditions.push(lte(dailyRecords.recordDate, resolvedRange.to));
    }
    const whereClause = conditions.length === 1 ? conditions[0] : and(...conditions as [typeof conditions[number], typeof conditions[number], ...typeof conditions]);

    const allRecords = await db
      .select()
      .from(dailyRecords)
      .where(whereClause)
      .orderBy(asc(dailyRecords.productId), asc(dailyRecords.recordDate));

    // Group records by product ID
    const recordsByProduct = allRecords.reduce((acc, record) => {
      if (!acc[record.productId]) {
        acc[record.productId] = [];
      }
      acc[record.productId].push(record);
      return acc;
    }, {} as Record<number, typeof allRecords>);

    // Transform data for each product
    productSeries = selectedProducts.map(product => {
      const records = recordsByProduct[product.id] || [];
      
      const chartData: ChartDataPoint[] = records.map(record => {
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

      return {
        productId: product.id,
        productName: product.name,
        productCode: product.productCode,
        data: chartData
      };
    });
  }

  return (
    <div className="bg-gradient-to-br from-background via-background to-accent/10 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}


        {/* Dashboard Client Components */}
        <DashboardClientWrapper
          allProducts={allProducts}
          productSeries={productSeries}
          selectedProducts={selectedProducts}
        />
      </div>
    </div>
  );
}
