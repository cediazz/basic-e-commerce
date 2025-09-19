// components/products/ProductCard.tsx
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/cartContext";

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image_url: string;
  category: string;
  is_active: boolean;
  created_at: string;
}

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  
  const [imageError, setImageError] = useState(false)
  const { addItem } = useCart()

  const handleAddToCart = (product: Product) => {
    addItem(product)
  }

  return (
    <Card className="w-full max-w-sm overflow-hidden hover:shadow-lg transition-all duration-300 group">
      <CardHeader className="p-0 relative">
        <div className="relative overflow-hidden">
          {imageError ? (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <Link href={`/products/${product.id}`}>
                <span className="text-gray-500">Imagen no disponible</span>
              </Link>
            </div>
          ) : (
            <Link href={`/products/${product.id}`}>
              <Image
                src={product.image_url}
                alt={product.name}
                //fill
                width={500}
                height={500}
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                onError={() => setImageError(true)}
              />
            </Link>
          )}
        </div>
      </CardHeader>

      {/* Contenido */}
      <CardContent className="p-4 space-y-2">
        {/* Nombre del producto */}
        <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>

        {/* Precio */}
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-gray-900">
            ${product.price}
          </span>
        </div>
      </CardContent>

      {/* Footer con botón de compra */}
      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full"
          disabled={!product.is_active}
          onClick={() => handleAddToCart(product)}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {product.is_active ? "Agregar al carrito" : "Agotado"}
        </Button>
      </CardFooter>
    </Card>
  );
}
