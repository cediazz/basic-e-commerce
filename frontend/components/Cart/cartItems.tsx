"use client";

import { useCart } from "@/context/cartContext";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, FilePlus2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function CartItems() {
  const { items, updateQuantity, removeItem, total } = useCart();

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto max-h-[400px] space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-4 border-b pb-4">
            <div className="relative h-16 w-16 rounded-md overflow-hidden ml-3">
              <Link href={`/products/${item.id}`}>
                <Image
                  src={item.image_url}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </Link>
            </div>
            <div className="flex-1">
              <Link href={`/products/${item.id}`}>
                <h3 className="font-medium">{item.name}</h3>
                <p className="text-sm text-gray-500">${item.price}</p>
              </Link>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="w-8 text-center">{item.quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeItem(item.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      <div className="pt-4 border-t mt-auto">
        <div className="flex justify-between text-lg font-semibold ml-3">
          <span>Total:</span>
          <span className="mr-3">${total.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-center mt-4">
          <Button>
            <FilePlus2 /> Crear Orden de compra
          </Button>
        </div>
      </div>
    </div>
  );
}
