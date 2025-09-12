// components/products/ProductCard.tsx
"use client"

import { useState } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Heart, ShoppingCart, Star, Eye } from 'lucide-react'

export interface Product {
    id: number
    name: string
    description: string
    price: number
    originalPrice?: number
    image_url: string
    category: string
    is_active: boolean,
    created_at: string
}

interface ProductCardProps {
    product: Product
    onAddToCart?: (product: Product) => void
    onQuickView?: (product: Product) => void
}

export function ProductCard({
    product,
    onAddToCart,
    onQuickView,
}: ProductCardProps) {

    const [imageError, setImageError] = useState(false)

    return (
        <Card className="w-full max-w-sm overflow-hidden hover:shadow-lg transition-all duration-300 group">
            {/* Header con imagen */}
            <CardHeader className="p-0 relative">
                <div className="relative aspect-square overflow-hidden">
                    {imageError ? (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500">Imagen no disponible</span>
                        </div>
                    ) : (
                        <img
                            src={product.image_url}
                            alt={product.name}
                            //fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={() => setImageError(true)}
                        />
                    )}

                    {/* Badges superpuestos */}
                    <div className="absolute top-3 left-3 space-y-2">
                        {product.category && (
                            <Badge variant="outline" className="text-xs bg-white/90">
                                {product.category}
                            </Badge>
                        )}
                    </div>

                    {/* Acciones rápidas */}
                    <div className="absolute top-3 right-3 space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm"
                            onClick={() => onQuickView?.(product)}
                        >
                            <Eye className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>

            {/* Contenido */}
            <CardContent className="p-4 space-y-2">
                {/* Nombre del producto */}
                <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-blue-600 transition-colors">
                    {product.name}
                </h3>

                {/* Descripción */}
                <p className="text-sm text-gray-600 line-clamp-2 min-h-[2.5rem]">
                    {product.description}
                </p>

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
                    onClick={() => onAddToCart?.(product)}
                >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {product.is_active ? 'Agregar al carrito' : 'Agotado'}
                </Button>
            </CardFooter>
        </Card>
    )
}