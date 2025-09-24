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
  DollarSign
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

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
  const router = useRouter();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pendiente':
        return 'secondary';
      case 'completado':
        return 'default';
      case 'cancelado':
        return 'destructive';
      case 'enviado':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha</p>
                    <p className="font-medium">{formatDate(order.order_date)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Cliente ID</p>
                    <p className="font-medium">#{order.customer_id}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Método de Pago</p>
                    <p className="font-medium">{order.payment_method}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant={getStatusVariant(order.status)}>
                    {order.status}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Dirección de Envío</p>
                  <p className="font-medium">{order.shipping_address}</p>
                </div>
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
                  <div key={item.id} className="flex items-center gap-4 p-3 border rounded-lg">
                    <div className="relative h-16 w-16 flex-shrink-0">
                      <Image
                        src={item.product.image_url}
                        alt={item.product.name}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold truncate">{item.product.name}</h4>
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
              <Button className="w-full" variant="outline">
                Imprimir Factura
              </Button>
              <Button className="w-full" variant="outline">
                Reenviar Confirmación
              </Button>
              {order.status === 'pendiente' && (
                <Button className="w-full">
                  Marcar como Completado
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
                <Badge variant={order.status === 'pendiente' ? 'secondary' : 'default'}>
                  {order.status === 'pendiente' ? 'Pendiente' : 'Pagado'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fecha de pago:</span>
                <span>{formatDate(order.order_date)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}