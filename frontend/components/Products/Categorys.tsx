'use client'
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation'
import { getData } from "@/utils/getData"
import { Suspense } from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Dispatch } from "react";
import { Search } from "lucide-react";

const FormSchema = z.object({
    category: z
        .string({
            required_error: "Debe seleccionar una categoría",
        })
})

interface CategoryProps{
    setCategory: Dispatch<string>,
    getProductsByCategory: (category: string) => void
}

export default function Categorys({setCategory,getProductsByCategory}: CategoryProps) {
    
    const [categorys, setCategorys] = useState<[] | null>()
    const [isLoadingCategories, setIsLoadingCategories] = useState(true)
    const router = useRouter()
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
    })

    
    
    function onSubmit(data: z.infer<typeof FormSchema>) {
       setCategory(data.category)
       getProductsByCategory(data.category)
    }


    const getGategorys = async () => {
        const data = await getData("/products/categorys")
        if (data === 401) {
            router.push('/login')
        }
        else setCategorys(data)
        setIsLoadingCategories(false)
    }

    useEffect(() => {
        const categorys = async () => {
            await getGategorys()
        }
        categorys()
    }, [])

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="">
                    <div className="grid grid-cols-1  lg:grid-cols-1 xl:grid-cols-3 gap-8">
                    <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Buscar por Categoria</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                             {isLoadingCategories ? (
                                                <SelectValue placeholder="Cargando categorías..." />
                                            ) : (
                                                <SelectValue placeholder="Seleccione una categoría" />
                                            )}
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="all">Todas las categorías</SelectItem>
                                        {categorys && categorys.map(category => (
                                            <SelectItem key={category} value={category}>{category}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button className="mt-5" type="submit" disabled={isLoadingCategories}><Search /> Buscar</Button>
                    </div>
                </form>
            </Form>
        </Suspense>
    )
}