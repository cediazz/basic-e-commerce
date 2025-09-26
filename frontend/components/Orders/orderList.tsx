"use client"
import { useState } from "react"
import { useRouter } from 'next/navigation'
import LoadingProducts from "@/app/(protected)/products/loading"
import { MyPagination } from "../Pagination/Pagination"
import { getData } from "@/utils/getData"
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
import { Eye, Trash2 } from "lucide-react"

interface OrderProps {
    data: any
}

export default function OrdersList({ data }: OrderProps) {

    const [ordersData, setOrdersData] = useState<any>(data)
    const [isLoading, setIsLoading] = useState(false)

    return (
        <div>
            <>
                <div className="grid grid-cols-1  lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
                    <div>
                        <h2 className="scroll-m-20 border-b pb-2 font-semibold tracking-tight first:mt-0">
                            Cantidad de ordenes: {data.count && data.count}
                        </h2>
                    </div>

                </div>
                <div className="mt-3">
                    {data && data.results.length > 0 ? <Table>
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
                            {data.results.map((order: any) => (
                                <TableRow>
                                    <TableCell className="font-medium">{order.id}</TableCell>
                                    <TableCell>{formatDate(order.order_date)}</TableCell>
                                    <TableCell>{order.status}</TableCell>
                                    
                                        <TableCell>
                                            <Link href={`/orders/${order.id}`}>
                                            <Button size="icon" className="size-8">
                                              <Eye />
                                            </Button>
                                            </Link>
                                            <Link href={`/orders/${order.id}`} className="ml-3">
                                            <Button variant="destructive" size="icon" className="size-8">
                                              <Trash2 />
                                            </Button>
                                            </Link>
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
                    {data && data.results.length > 0 &&
                        <MyPagination
                            data={ordersData}
                            setData={setOrdersData}
                            setLoading={setIsLoading}
                        />}
                </div>

            </>

        </div>
    )
}