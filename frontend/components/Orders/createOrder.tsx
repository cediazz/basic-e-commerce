// components/order-create-form.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, ShoppingCart } from "lucide-react";
import { z } from "zod"
import { useCart } from "@/context/cartContext";
import Link from "next/link";
import { useAuth } from "@/context/userContext"
import { postData } from "@/utils/postData";
import { useRouter } from 'next/navigation'
import { Loader2Icon } from "lucide-react"
import { toast } from "sonner"

interface OrderCreateFormProps {
    paymentMethods: string[]
}

export function OrderCreateForm({ paymentMethods }: OrderCreateFormProps) {

    const { items, total } = useCart()
    const { user } = useAuth()
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const FormSchema = z.object({
        paymentMethod: z.string({
            required_error: "Debe seleccionar un metodo de pago",
        }),
        shippingAddress: z.string({
            required_error: "Debe establecer la dirección de envío",
        }),

    })

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
    })

    const handleSubmit = async (data: z.infer<typeof FormSchema>) => {
        setLoading(true)
        const orderData = {
            customer_id: user?.id,
            total_amount: total,
            payment_method: data.paymentMethod,
            shipping_address: data.shippingAddress,
            items: items.map((item) => {
                return {
                    product_id: item.id,
                    quantity: item.quantity,
                    unit_price: item.price
                }
            })
        }
        const orderOperation = await postData("/orders/", orderData)
        if (orderOperation === 401 || orderOperation === undefined) {
            router.push('/login')
        }
        toast(`Orden creada satisfactoriamente`, {
              action: {
                label: "Cerrar",
                onClick: () => console.log("Undo"),
              },
              position:"top-center",
              duration : 5000
            })
        setLoading(false)
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-6 w-6" />
                    Crear Nueva Orden
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                        {/* Total */}
                        <Card className="bg-primary/5">
                            <CardContent className="p-4">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-lg font-semibold">Productos:</span>
                                </div>

                                {items.map((item, index) => (
                                    <div key={index} className="flex justify-between items-center mb-3">
                                        <span className="text-base font-medium flex-1 mr-4">
                                            <Link href={`/products/${item.id}`}>
                                                {item.name} ({item.quantity})
                                            </Link>
                                        </span>
                                        <span className="text-lg font-semibold text-primary whitespace-nowrap">
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </span>
                                    </div>
                                ))}

                                <div className="flex justify-between items-center pt-3 mt-3 border-t">
                                    <span className="text-lg font-semibold">Total:</span>
                                    <span className="text-2xl font-bold text-primary">
                                        ${total.toFixed(2)}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                        {/* Método de Pago */}
                        <FormField
                            control={form.control}
                            name="paymentMethod"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Método de Pago</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona un método de pago" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {paymentMethods.map(paymentMeth => (
                                                <SelectItem key={paymentMeth} value={paymentMeth}>
                                                    {paymentMeth}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Dirección de Envío */}
                        <FormField
                            control={form.control}
                            name="shippingAddress"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Dirección de Envío</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Ingresa la dirección completa de envío..."
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Botón de Envío */}
                        <div className="flex gap-4">
                            <Button
                                type="submit"
                                disabled={items.length === 0}
                                className="flex-1"
                            >
                                {loading && <Loader2Icon className="animate-spin" />}
                                    
                                <ShoppingCart className="h-4 w-4 mr-2" />
                                Crear Orden
                                    
                               
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}