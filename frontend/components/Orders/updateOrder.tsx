"use client";

import { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, Loader2Icon, PackagePlus, PackageMinus, Trash2, ArrowLeft } from "lucide-react";
import { z } from "zod"
import { useCart } from "@/context/cartContext"
import Link from "next/link"
import { putData } from "@/utils/putData";
import { useRouter } from 'next/navigation'
import { toast } from "sonner"
import { Order, OrderItem } from "./orderDetail";
import { AlertDialogDelete } from "../Alerts/alertDialog"
import { deleteData } from "@/utils/deleteData"
import LoadingUpdateOrders from "@/app/(protected)/orders/update/[slug]/loading"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"

interface OrderUpdateFormProps {
    paymentMethods: string[],
    order: Order
}

export function OrderUpdateForm({ paymentMethods, order }: OrderUpdateFormProps) {

    const { items, updateQuantity, removeItem } = useCart()
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [orderData, setOrderData] = useState<OrderUpdateFormProps['order']>(order)
    const [totalAmount, setTotalAmount] = useState<number>() //cartItems + ItemsBD

    useEffect(() => {

        const orderItemsTotal = orderData.items.reduce((sum, item) =>
            sum + (Number(item.unit_price) * item.quantity), 0
        )

        const itemsCartTotal = items.filter(
            item => item.id != orderData.items.find(itemA => itemA.product.id === item.id)?.product.id
        ).reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)

        const newTotal = Number(itemsCartTotal) + orderItemsTotal

        setTotalAmount(parseFloat(newTotal.toFixed(2)))
    }, [items, orderData.items])

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
        defaultValues: {
            paymentMethod: orderData.payment_method,
            shippingAddress: orderData.shipping_address
        }
    })

    const handleSubmit = async (data: z.infer<typeof FormSchema>) => {
        setLoading(true)
        const orderDatatoSend = {
            customer_id: orderData.customer_id,
            total_amount: totalAmount,
            payment_method: data.paymentMethod,
            shipping_address: data.shippingAddress,
            status: "pendiente",
            items: [
                // Items del carrito (nuevos)
                ...items.filter(item => item.id != orderData.items.find(itemA => itemA.product.id === item.id)?.product.id).map(item => ({
                    product_id: item.id,
                    quantity: item.quantity,
                    unit_price: item.price.toString(),
                })),
                // Items existentes de la BD
                ...orderData.items.map(item => ({
                    product_id: item.product.id,
                    quantity: item.quantity,
                    unit_price: item.unit_price,
                    id: item.id // Incluir ID para actualizar
                }))
            ]
        }
        const orderOperation = await putData(`/orders/${orderData.id}`, orderDatatoSend)
        if (orderOperation === 401 || orderOperation === undefined) {
            router.push('/login')
        }
        toast.success(`Orden editada satisfactoriamente`, {
            action: {
                label: "Cerrar",
                onClick: () => console.log("Undo")
            },
            position: "top-center",
            duration: 5000
        })
        setLoading(false)
        router.push(`/orders/${orderOperation.id}`)
    }

    const updateOrderData = (id: number) => {
        setOrderData(prev => ({
            ...prev,
            items: prev.items.filter(item => item.id !== id)
        }))
    }

    const IncreaseItem = (item: OrderItem) => {
        setOrderData(prev => ({
            ...prev,
            items: prev.items.map(
                (currentItem: OrderItem) => currentItem.id === item.id ?
                    {
                        ...currentItem,
                        quantity: currentItem.quantity + 1,
                        subtotal: (currentItem.quantity * Number(currentItem.unit_price)).toString()
                    }
                    :
                    currentItem
            )
        }))
    }

    const decreaseItem = (item: OrderItem) => {
        setOrderData(prev => ({
            ...prev,
            items: prev.items.map(
                (currentItem: OrderItem) => currentItem.id === item.id && currentItem.quantity > 1 ?
                    {
                        ...currentItem,
                        quantity: currentItem.quantity - 1,
                        subtotal: ((currentItem.quantity - 1) * Number(currentItem.unit_price)).toString()
                    }
                    :
                    currentItem
            )
        }))
    }

    const deleteItem = async (itemId: number) => {
        setLoading(true)
        const data = await deleteData(`/orders/order_items/${itemId}`)
        console.log(data)
        if (data === 401 || data === undefined) {
            router.push('/login')
        }
        if (data === 204) {
            updateOrderData(itemId)
        }
        setLoading(false)

    }

    if (loading) return <LoadingUpdateOrders />

    return (
        <>
            <div className="flex items-center gap-4 mb-3">
                <Button
                    onClick={() => router.push("/orders/list")}
                    className="flex items-center gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Listado de ordenes
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ShoppingCart className="h-6 w-6" />
                        Editar Orden
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Card className="bg-primary/5">
                        <CardContent className="p-4">
                            {items.filter(item => item.id != orderData.items.find(itemA => itemA.product.id === item.id)?.product.id).length != 0 &&
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-lg font-semibold">Productos del carrito:</span>
                                </div>}
                            {items.filter(item => item.id != orderData.items.find(itemA => itemA.product.id === item.id)?.product.id).map((item, index) => (
                                <div key={index} className="flex justify-between items-center mb-3">
                                    <span className="text-base font-medium flex-1 mr-4">
                                        <Link href={`/products/${item.id}`}>
                                            {item.name}({item.quantity})
                                            <span className="text-lg font-semibold text-primary whitespace-nowrap ml-1">
                                                ${item.price}
                                            </span>
                                        </Link>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button size="icon" onClick={() => updateQuantity(item.id, item.quantity + 1)} className="size-8 ml-1">
                                                    <PackagePlus />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Agregar</p>
                                            </TooltipContent>
                                        </Tooltip>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button size="icon" onClick={() => updateQuantity(item.id, item.quantity - 1)} className="size-8 ml-1">
                                                    <PackageMinus />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Quitar</p>
                                            </TooltipContent>
                                        </Tooltip>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="destructive" size="icon" onClick={() => removeItem(item.id)} className="size-8 ml-1">
                                                    <Trash2 />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Eliminar</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </span>
                                    <span className="text-lg font-semibold text-primary whitespace-nowrap">
                                        ${(item.price * item.quantity).toFixed(2)}
                                    </span>
                                </div>
                            ))}
                            {orderData.items.length != 0 &&
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-lg font-semibold">Productos de la orden:</span>
                                </div>}
                            {orderData.items.map((item, index) => (
                                <div key={index} className="flex justify-between items-center mb-3">
                                    <span className="text-base font-medium flex-1 mr-4">
                                        <Link href={`/products/${item.product.id}`}>
                                            {item.product.name}({item.quantity})
                                            <span className="text-lg font-semibold text-primary whitespace-nowrap ml-1">
                                                ${item.unit_price}
                                            </span>
                                        </Link>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button size="icon" onClick={() => IncreaseItem(item)} className="size-8 ml-1">
                                                    <PackagePlus />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Agregar</p>
                                            </TooltipContent>
                                        </Tooltip>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button size="icon" onClick={() => decreaseItem(item)} className="size-8 ml-1">
                                                    <PackageMinus />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Quitar</p>
                                            </TooltipContent>
                                        </Tooltip>
                                        <AlertDialogDelete
                                            entityID={item.id}
                                            entityName="Producto de la orden"
                                            deleteFunction={deleteItem}
                                        />
                                    </span>
                                    <span className="text-lg font-semibold text-primary whitespace-nowrap">
                                        ${(Number(item.unit_price) * item.quantity).toFixed(2)}
                                    </span>
                                </div>
                            ))}

                            <div className="flex justify-between items-center pt-3 mt-3 border-t">
                                <span className="text-lg font-semibold">Total:</span>
                                <span className="text-2xl font-bold text-primary">
                                    ${totalAmount && totalAmount.toFixed(2)}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 mt-3">

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
                                    disabled={items.length === 0 && orderData.items.length === 0}
                                    className="flex-1"
                                >
                                    {loading && <Loader2Icon className="animate-spin" />}

                                    <ShoppingCart className="h-4 w-4 mr-2" />
                                    Guardar


                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </>
    );
}