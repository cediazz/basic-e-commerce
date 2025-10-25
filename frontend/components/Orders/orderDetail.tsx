"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  MapPin,
  CreditCard,
  Package,
  User,
  ArrowLeft,
  ShoppingCart,
  DollarSign,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/context/userContext";
import { formatDate } from "@/utils/formats";
import { postData } from "@/utils/postData";
import { useState } from "react"
import { Loader2Icon } from "lucide-react"

export interface OrderItem {
  id: number;
  quantity: number;
  unit_price: string;
  subtotal: string;
  created_at: string;
  product: {
    id: number;
    name: string;
    description: string;
    price: string;
    category: string;
    image_url: string;
    is_active: boolean;
    created_at: string;
  };
}

export interface Order {
  id: number;
  customer_id: number;
  order_date: string;
  total_amount: string;
  status: string;
  payment_method: string;
  shipping_address: string;
  items: OrderItem[];
}

interface OrderDetailsProps {
  order: Order;
}

export function OrderDetails({ order }: OrderDetailsProps) {
  
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState<boolean>(false)

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "pendiente":
        return "secondary";
      case "completado":
        return "default";
      case "cancelado":
        return "destructive";
      case "enviado":
        return "outline";
      default:
        return "secondary";
    }
  };

  const handlePayment = async () => {
    setLoading(true)
    const paymentData = {
      id:order.id,
      items: order.items,
      customer_email: user?.email,
      success_url: `${window.location.origin}/orders/${order.id}`,
      cancel_url: `${window.location.origin}`,
    };
    console.log(paymentData);
    const data = await postData("/stripe/create-checkout-session", paymentData);
    console.log(data);
    if (data === 401 || data === undefined) {
      router.push("/login");
    }
    else {
      // 3. Redirigir a Stripe Checkout
      window.open(data.url, '_blank', 'noopener,noreferrer')
    }
    setLoading(false)
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-3">
        <Button
          onClick={() => router.push("/orders/list")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Listado de ordenes
        </Button>
        <h1 className="text-3xl font-bold">Detalles de la Orden</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda - Información principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tarjeta de información de la orden */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Información de la Orden #{order.id}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Grid principal */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Columna izquierda - Información de la orden */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> Fecha
                      </p>
                      <p className="font-medium">
                        {formatDate(order.order_date)}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <CreditCard className="h-3 w-3" /> Pago
                      </p>
                      <p className="font-medium capitalize">
                        {order.payment_method?.toLowerCase()}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <User className="h-3 w-3" /> Cliente ID
                      </p>
                      <p className="font-medium">#{order.customer_id}</p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Estado</p>
                      <Badge variant={getStatusVariant(order.status)}>
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Columna derecha - Información del cliente */}
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      Información del Cliente
                    </p>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Nombre completo
                        </p>
                        <p className="font-medium">
                          {user?.fullname || "No disponible"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="font-medium truncate">
                          {user?.email || "No disponible"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dirección de envío - Full width */}
              <div className="pt-4 border-t">
                <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> Dirección de Envío
                </p>
                <p className="font-medium whitespace-pre-line bg-muted/30 p-3 rounded-md">
                  {order.shipping_address}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Tarjeta de productos */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Productos ({order.items.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-3 border rounded-lg"
                  >
                    <div className="relative h-16 w-16 flex-shrink-0">
                      <Image
                        src={item.product.image_url}
                        alt={item.product.name}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold truncate">
                        {item.product.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {item.product.category}
                      </p>
                      <p className="text-sm">Cantidad: {item.quantity}</p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="font-semibold">${item.unit_price} c/u</p>
                      <p className="text-lg font-bold text-primary">
                        ${item.subtotal}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Columna derecha - Resumen */}
        <div className="space-y-6">
          {/* Tarjeta de resumen */}
          <Card>
            <CardHeader>
              <CardTitle>Resumen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Subtotal:</span>
                <span>${order.total_amount}</span>
              </div>

              <div className="flex justify-between items-center">
                <span>Envío:</span>
                <span>Gratis</span>
              </div>

              <div className="border-t pt-3">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-primary">${order.total_amount}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tarjeta de acciones */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" variant="outline" disabled>
                Imprimir Factura
              </Button>
              {order.status === "pendiente" && (
                <Button className="w-full" onClick={() => handlePayment()}>
                  {loading && <Loader2Icon className="animate-spin" />}
                  Pagar
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Tarjeta de información del pago */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Información de Pago
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Método:</span>
                <span>{order.payment_method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estado:</span>
                <Badge
                  variant={
                    order.status === "pendiente" ? "secondary" : "default"
                  }
                >
                  {order.status}
                </Badge>
              </div>
              {order.status === "pagado" && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fecha de pago:</span>
                  <span>{formatDate(order.order_date)}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
