"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Product {
  id: number;
  productCode: string;
  name: string;
}

interface ProductSelectorProps {
  products: Product[];
  selectedProductId?: number;
}

export function ProductSelector({ products, selectedProductId }: ProductSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleProductChange = (productId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("productId", productId);
    router.push(`/dashboard?${params.toString()}`);
  };

  if (products.length === 0) {
    return (
      <div className="flex items-center gap-3 text-sm">
        <span className="text-muted-foreground">No products yet.</span>
        <Button asChild size="sm" variant="outline" className="cursor-pointer">
          <Link href="/upload">Go upload data →</Link>
        </Button>
      </div>
    );
  }

  const selectedProduct = products.find(p => p.id === selectedProductId);

  return (
    <div className="w-full max-w-md">
      <Select
        value={selectedProductId?.toString() || ""}
        onValueChange={handleProductChange}
      >
        <SelectTrigger>
          <SelectValue 
            placeholder="Select a product..." 
            className="text-left"
          >
            {selectedProduct 
              ? `${selectedProduct.name} (${selectedProduct.productCode})`
              : "Select a product..."
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {products.map((product) => (
            <SelectItem key={product.id} value={product.id.toString()}>
              <div className="flex flex-col">
                <span className="font-medium">{product.name}</span>
                <span className="text-xs text-muted-foreground">
                  Code: {product.productCode}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
