"use client"
import { useState } from "react"
import { useRouter } from 'next/navigation'
import LoadingOrdersList from "@/app/(protected)/orders/list/loading"
import { MyPagination } from "../Pagination/Pagination"
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { formatDate } from "@/utils/formats"
import Link from "next/link";
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { AlertDialogDelete } from "../Alerts/alertDialog"
import { deleteData } from "@/utils/deleteData"
import { getData } from "@/utils/getData"
import FiltersOrderForm from "./filtersOrdersForm"
import { useAuth } from "@/context/userContext"

interface OrderProps {
    data: {
        count: number,
        next: string,
        previous: string,
        results: Array<{
            id: number,
            order_date: string,
            status: string
        }>
    }
}

export default function OrdersList({ data }: OrderProps) {

    const [ordersData, setOrdersData] = useState<OrderProps['data']>(data)
    const [isLoading, setIsLoading] = useState(false)
    const { user } = useAuth()
    const router = useRouter()

    const getOrders = async (limit:string,offset:string) => {
        setIsLoading(true)
        const data = await getData(`/orders/?user_id=${user?.id}&offset=${offset}&limit=${limit}`)
        console.log(data)
        if (data === 401 || data === undefined) {
            router.push('/login')
        }
        else setOrdersData(data)
        setIsLoading(false)
    }

    const updateOrderList = (id: number) => {
        setOrdersData(prev => ({
            ...prev,
            count: prev.count - 1,
            results: prev.results.filter(order => order.id !== id)
        }))
    }

    const deleteOrder = async (id: number) => {
        setIsLoading(true)
        const data = await deleteData(`/orders/${id}`)
        console.log(data)
        if (data === 401 || data === undefined) {
            router.push('/login')
        }
        if (data === 204) {
            updateOrderList(id)
        }
        setIsLoading(false)

    }

    if (isLoading) return <LoadingOrdersList />

    return (
        <div>
            <FiltersOrderForm getOrders={getOrders} />
            <div className="grid grid-cols-1  lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
                <div>
                    <h2 className="scroll-m-20 border-b pb-2 font-semibold tracking-tight first:mt-0">
                        Cantidad de ordenes: {ordersData.count && ordersData.count}
                    </h2>
                </div>

            </div>
            <div className="mt-3">
                {ordersData && ordersData.results.length > 0 ? <Table>
                    <TableCaption>Listado de ordenes</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">Id</TableHead>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Opciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {ordersData.results.map((order: any) => (
                            <TableRow key={order.id}>
                                <TableCell className="font-medium">{order.id}</TableCell>
                                <TableCell>{formatDate(order.order_date)}</TableCell>
                                <TableCell>{order.status}</TableCell>

                                <TableCell>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Link href={`/orders/${order.id}`}>
                                                <Button size="icon" className="size-8">
                                                    <Eye />
                                                </Button>
                                            </Link>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Detalles</p>
                                        </TooltipContent>
                                    </Tooltip>
                                    <AlertDialogDelete
                                        entityID={order.id}
                                        entityName="Orden"
                                        deleteFunction={deleteOrder}
                                    />
                                </TableCell>

                            </TableRow>
                        ))}
                    </TableBody>
                </Table> :
                    <h1 className="font-semibold text-muted-foreground">
                        No se encontraron ordenes
                    </h1>
                }
            </div>
            <div className="grid grid-cols-1  lg:grid-cols-2 xl:grid-cols-1 gap-6 mt-8">
                {ordersData && ordersData.results.length > 0 &&
                    <MyPagination
                        data={ordersData}
                        setData={setOrdersData}
                        setLoading={setIsLoading}
                    />}
            </div>



        </div>
    )
}