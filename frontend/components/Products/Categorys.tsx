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
    FormDescription,
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

const FormSchema = z.object({
    category: z
        .string({
            required_error: "Debe seleccionar una categoría",
        })
})

interface CategoryProps{
    setProducts: Dispatch<any>
}

export default function Categorys({setProducts}: CategoryProps) {
    
    const [categorys, setCategorys] = useState<[] | null>()
    const router = useRouter()
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
    })

    const getProductsByCategory = async (category: string) => {
        const data = await getData(`/products/?category=${category}&offset=0&limit=20`)
        if (data === 401) {
          router.push('/login')
        }
        else setProducts(data.results)
      }
    
    function onSubmit(data: z.infer<typeof FormSchema>) {
       getProductsByCategory(data.category)
    }


    const getGategorys = async () => {
        const data = await getData("/products/categorys")
        if (data === 401) {
            router.push('/login')
        }
        else setCategorys(data)
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
                <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
                    <div className="grid grid-cols-1  lg:grid-cols-1 xl:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Seleccione la Categoria</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccione una categoría" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {categorys && categorys.map(category => (
                                            <SelectItem key={category} value={category}>{category}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button className="mt-5" type="submit">Submit</Button>
                    </div>
                </form>
            </Form>
        </Suspense>
    )
}