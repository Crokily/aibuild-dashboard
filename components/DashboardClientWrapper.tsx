"use client"

import { useState } from "react"
import { ChartCustomizer } from "./ChartCustomizer"
import { ProductChart } from "./ProductChart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// Import types from dashboard page
import type { ProductSeries, Product } from "../app/dashboard/page"

interface DashboardClientWrapperProps {
  allProducts: Product[]
  productSeries: ProductSeries[]
  selectedProducts: Product[]
}

interface EnabledCurves {
  inventory: boolean
  procurement: boolean
  sales: boolean
}

export function DashboardClientWrapper({
  allProducts,
  productSeries,
  selectedProducts,
}: DashboardClientWrapperProps) {
  // Manage curve selection state locally
  const [enabledCurves, setEnabledCurves] = useState<EnabledCurves>({
    inventory: true,
    procurement: true,
    sales: true,
  })

  return (
    <>
      {/* Chart Customization */}
      <ChartCustomizer 
        products={allProducts} 
        maxSelection={5}
        enabledCurves={enabledCurves}
        onCurvesChange={setEnabledCurves}
      />

      {/* Chart */}
      {selectedProducts.length > 0 && productSeries.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedProducts.length === 1 
                ? `${selectedProducts[0].name} (${selectedProducts[0].productCode})`
                : `Comparison of ${selectedProducts.length} Products`
              }
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ProductChart 
              productSeries={productSeries}
              enabledCurves={enabledCurves}
            />
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
                No daily records found for the selected products.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )
}
