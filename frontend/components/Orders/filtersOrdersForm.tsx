'use client'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Search } from "lucide-react"

const FormSchema = z.object({
    limit: z.coerce
        .number({
            required_error: "Debe ingresar un número",
            invalid_type_error: "Debe ser un número válido"
        })
        .min(1, "El límite no puede ser inferior a 1")
        .max(20, "El límite no puede ser superior a 20"),
    offset: z.coerce
        .number({
            required_error: "Debe ingresar un número",
            invalid_type_error: "Debe ser un número válido"
        })
        .min(0, "El registro inicial no puede ser inferior a 0")
})

interface FiltersOrderProps {
    getOrders: (limit:string,offset:string) => void,
}

export default function FiltersOrderForm({
    getOrders,
}: FiltersOrderProps) {

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            limit: 20,
            offset: 0
        }
    })

    function onSubmit(data: z.infer<typeof FormSchema>) {
       getOrders(data.limit.toString(),data.offset.toString())
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="">
                <div className="grid grid-cols-1 lg:grid-cols-1 xl:grid-cols-3 gap-8 items-end">
                    {/* Campo Límite */}
                    <FormField
                        control={form.control}
                        name="limit"
                        render={({ field }) => (
                            <FormItem>
                                <FormMessage />
                                <FormLabel>Registros por página</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min="1"
                                        max="20"
                                        {...field}
                                        onChange={(e) => field.onChange(e.target.valueAsNumber || e.target.value)}
                                        value={field.value}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    {/* Campo Offset */}
                    <FormField
                        control={form.control}
                        name="offset"
                        render={({ field }) => (
                            <FormItem>
                                <FormMessage />
                                <FormLabel>Registro inicial</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min="0"
                                        {...field}
                                        onChange={(e) => field.onChange(e.target.valueAsNumber || e.target.value)}
                                        value={field.value}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    {/* Botón Submit */}
                    <Button
                        type="submit"
                        className="h-10"
                    >
                        <Search className="h-4 w-4 mr-2" />
                        Buscar
                    </Button>
                </div>
            </form>
        </Form>
    )
}