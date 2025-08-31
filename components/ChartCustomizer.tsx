"use client"

import { useState, useMemo, useEffect, startTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Check, ChevronsUpDown, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
//

interface Product {
  id: number
  productCode: string
  name: string
}

interface EnabledCurves {
  inventory: boolean
  procurement: boolean
  sales: boolean
}

interface ChartCustomizerProps {
  products: Product[]
  maxSelection?: number
  enabledCurves: EnabledCurves
  onCurvesChange: (curves: EnabledCurves) => void
}

export function ChartCustomizer({
  products,
  maxSelection = 5,
  enabledCurves,
  onCurvesChange,
}: ChartCustomizerProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  
  
  // Parse selected product IDs from URL
  const urlSelectedIds = useMemo(() => {
    const productsParam = searchParams.getAll("products")
    return productsParam.map(id => parseInt(id)).filter(id => !isNaN(id))
  }, [searchParams])

  // Local selection state to keep UI snappy and avoid racing router pushes
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  // Sync local state from URL when it actually differs
  useEffect(() => {
    const a = selectedIds
    const b = urlSelectedIds
    if (a.length !== b.length || a.some((v) => !b.includes(v))) {
      setSelectedIds(b)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlSelectedIds.join(",")])

  //

  // enabledCurves is now managed by parent component

  // Filter products based on search query
  const filteredProducts = useMemo(() => {
    if (!searchQuery) return products
    const query = searchQuery.toLowerCase()
    return products.filter(
      (product) => product.name.toLowerCase().includes(query) || product.productCode.toLowerCase().includes(query),
    )
  }, [products, searchQuery])

  // Get selected products for display
  const selectedProducts = useMemo(() => {
    return products.filter((product) => selectedIds.includes(product.id))
  }, [products, selectedIds])

  const updateURL = (productIds: number[]) => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete("products")
    productIds.forEach(id => params.append("products", id.toString()))
    // Use replace to avoid history spam and mark as low priority
    startTransition(() => {
      router.replace(`/dashboard?${params.toString()}`, { scroll: false })
    })
  }

  //

  const handleProductToggle = (productId: number) => {
    // Only update local state; URL is synced when the popover closes
    setSelectedIds((prev) => {
      const isSelected = prev.includes(productId)
      if (isSelected) {
        return prev.filter((id) => id !== productId)
      } else if (prev.length < maxSelection) {
        return [...prev, productId]
      }
      return prev
    })
  }

  // Removed tag close action to avoid delayed URL sync on rapid clicks

  const handleCurveToggle = (curve: keyof EnabledCurves) => {
    onCurvesChange({
      ...enabledCurves,
      [curve]: !enabledCurves[curve],
    })
  }

  const isAtMaxSelection = selectedIds.length >= maxSelection

  // No auto-selection when empty; leave selection blank by design

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Chart Customization</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">

        {/* Product Selector Section */}
        <div className="space-y-3">

          {/* Multi-select Dropdown */}
          <Popover 
            open={open} 
            onOpenChange={(next) => {
              setOpen(next)
              // When closing, commit the current local selection to URL once
              if (!next) {
                updateURL(selectedIds)
              }
            }}
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between text-left font-normal bg-transparent"
              >
                <span className="truncate">
                  {selectedProducts.length === 0
                    ? "Select products..."
                    : `${selectedProducts.length} product${selectedProducts.length === 1 ? "" : "s"} selected`}
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <div className="p-3 border-b">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <div className="max-h-60 overflow-auto">
                {filteredProducts.length === 0 ? (
                  <div className="p-4 text-sm text-muted-foreground text-center">No products found.</div>
                ) : (
                  <div className="p-1">
                    {filteredProducts.map((product) => {
                      const isSelected = selectedIds.includes(product.id)
                      const canSelect = !isSelected && !isAtMaxSelection

                      return (
                        <div
                          key={product.id}
                          className={cn(
                            "flex items-center space-x-2 rounded-sm px-2 py-1.5 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground",
                            !canSelect && !isSelected && "opacity-50 cursor-not-allowed",
                          )}
                          onClick={() => {
                            if (isSelected || canSelect) {
                              handleProductToggle(product.id)
                            }
                          }}
                        >
                          <div className="flex h-4 w-4 items-center justify-center">
                            {isSelected && <Check className="h-4 w-4" />}
                          </div>
                          <span className="flex-1 truncate">
                            {product.name} ({product.productCode})
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
              {isAtMaxSelection && (
                <div className="p-3 border-t bg-muted/50">
                  <p className="text-xs text-muted-foreground">Maximum {maxSelection} products can be selected</p>
                </div>
              )}
            </PopoverContent>
          </Popover>

          {/* Selected Products Tags */}
          {selectedProducts.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedProducts.map((product) => (
                <Badge key={product.id} variant="secondary" className="flex items-center gap-1 pr-1">
                  <span className="truncate max-w-40">
                    {product.name} ({product.productCode})
                  </span>
                </Badge>
              ))}
            </div>
          )}
        </div>

        <Separator />

        {/* Data Curves Section */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="inventory"
                checked={enabledCurves.inventory}
                onCheckedChange={() => handleCurveToggle("inventory")}
              />
              <Label htmlFor="inventory" className="text-sm font-normal cursor-pointer">
                Inventory
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="procurement"
                checked={enabledCurves.procurement}
                onCheckedChange={() => handleCurveToggle("procurement")}
              />
              <Label htmlFor="procurement" className="text-sm font-normal cursor-pointer">
                Procurement Amount
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="sales" checked={enabledCurves.sales} onCheckedChange={() => handleCurveToggle("sales")} />
              <Label htmlFor="sales" className="text-sm font-normal cursor-pointer">
                Sales Amount
              </Label>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
