"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShoppingCart, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  is_active: boolean;
  category: string;
  image_url: string;
  created_at: string;
}

interface ProductDetailProps {
  product: Product;
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const [imageError, setImageError] = useState(false)
  const router = useRouter()

  const handleAddToCart = () => {
    console.log("Agregar al carrito:", product);
    // Lógica para agregar al carrito
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Header y navegación */}
      <div className="container mx-auto px-4 mb-8">
        <Button
          onClick={() => router.back()}
          className="flex items-center gap-2 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver atrás
        </Button>
      </div>

      {/* Contenido principal */}
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Sección de imagen - GRANDE */}
          <div className="space-y-4">
            <Card className="overflow-hidden border-0 shadow-lg">
              <div className="relative aspect-square w-full h-[600px]">
                {imageError ? (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500 text-lg">
                      Imagen no disponible
                    </span>
                  </div>
                ) : (
                 <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    className="object-cover"
                    onError={() => setImageError(true)}
                    priority
                  />
                )}
              </div>
            </Card>
          </div>
          {/* Sección de información */}
          <div className="space-y-6">
            {/* Categoría y favoritos */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 uppercase tracking-wide">
                {product.category}
              </span>
            </div>
            {/* Nombre del producto */}
            <h1 className="text-4xl font-bold text-gray-900">{product.name}</h1>
            {/* Precio */}
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-900">
                ${product.price}
              </span>
              {product.price && (
                <span className="text-sm text-green-600 ml-2">
                  • Disponible
                </span>
              )}
            </div>
            {/* Descripción */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Descripción</h3>
              <p className="text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>
            {/* Información adicional */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-semibold">Categoría:</span>
                <p className="text-gray-600 capitalize">{product.category}</p>
              </div>
              <div>
                <span className="font-semibold">Disponibilidad:</span>
                <p
                  className={
                    product.is_active ? "text-green-600" : "text-red-600"
                  }
                >
                  {product.is_active ? "En stock" : "Agotado"}
                </p>
              </div>
              <div>
                <span className="font-semibold">ID del producto:</span>
                <p className="text-gray-600">#{product.id}</p>
              </div>
              <div>
                <span className="font-semibold">Agregado el:</span>
                <p className="text-gray-600">
                  {formatDate(product.created_at)}
                </p>
              </div>
            </div>
            {/* Botones de acción */}
            <div className="flex gap-4 pt-4">
              <Button
                size="lg"
                className="flex-1 h-14 text-lg"
                disabled={!product.is_active}
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Agregar al carrito
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="h-14 text-lg"
                disabled={!product.is_active}
              >
                Comprar ahora
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
