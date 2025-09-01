"use client"

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
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2Icon } from "lucide-react"
import { useState } from "react"
import { useRouter } from 'next/navigation'
import axios from "axios"

const FormSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().nonempty("Se requiere contraseña")
}
)
export default function LoginPage() {
  
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
      password: ""
    },
  })
  const [loading,setLoading] = useState<boolean>(false)
  const [error, setError] = useState('')
  const router = useRouter();
  
  async function onSubmit(data: z.infer<typeof FormSchema>) {
   setLoading(true)
   axios.post(`${process.env.NEXT_PUBLIC_BACKEND_HOST}/auth/login`,data)
  .then(function (response) {
    console.log(response.data)
    if (response.status === 200){
      localStorage.setItem('userData', response.data)
      //router.push('/home')
    }
    setLoading(false)
  })
  .catch(function (error) {
    setError(error)
    setLoading(false)
  });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Login</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input placeholder="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                {loading && <Loader2Icon className="animate-spin" />}
                Submit
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}