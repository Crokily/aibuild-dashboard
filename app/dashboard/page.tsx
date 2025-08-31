import { db } from "@/lib/db";
import { products, dailyRecords } from "@/lib/db/schema";
import { asc, inArray } from "drizzle-orm";
import { DashboardClientWrapper } from "../../components/DashboardClientWrapper";
//

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

  //

  let productSeries: ProductSeries[] = [];
  let selectedProducts: Product[] = [];

  if (selectedProductIds.length > 0 && allProducts.length > 0) {
    // Find the selected products
    selectedProducts = allProducts.filter(p => selectedProductIds.includes(p.id));

    // Get daily records for ALL selected products at once
    const allRecords = await db
      .select()
      .from(dailyRecords)
      .where(inArray(dailyRecords.productId, selectedProductIds))
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
