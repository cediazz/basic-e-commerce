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
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardAction } from "@/components/ui/card"
import { Loader2Icon } from "lucide-react"
import { useState } from "react"
import axios from "axios"
import MyAlert from "@/components/Alerts/alert"
import Link from 'next/link'
import { useAuth } from "@/context/userContext"
import { redirect } from 'next/navigation'
import { useRouter } from 'next/navigation'

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
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const router = useRouter()
  
  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setLoading(true)
    let formData = new FormData()
    formData.append('email', data.email)
    formData.append('password', data.password)
    axios.post(`${process.env.NEXT_PUBLIC_BACKEND_HOST}/auth/login`, formData)
      .then(function (response) {
        if (response.status === 200) {
          login(response.data).then(()=>{
            router.push("/products")
          })
        }
        setLoading(false)
      })
      .catch(function (error) {
        setError(error.response?.data?.detail || 'Error de autenticación')
        setLoading(false)
      });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Accede con tu cuenta</CardTitle>
          <CardDescription>
            Ingrese su correo electrónico a continuación para iniciar sesión en su cuenta
          </CardDescription>
          <CardAction>
            <Link href="/register"><Button variant="link">Registrarse</Button></Link>
          </CardAction>
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
                      <Input  placeholder="email" {...field} />
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
                Enviar
              </Button>
            </form>
          </Form>
        </CardContent>
        {error && <MyAlert message={error} />}
      </Card>
    </div>
  )
}