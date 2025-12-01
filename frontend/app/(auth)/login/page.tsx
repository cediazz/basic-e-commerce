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
import { Loader2Icon, Info } from "lucide-react"
import { useState } from "react"
import axios from "axios"
import MyAlert from "@/components/Alerts/alert"
import Link from 'next/link'
import { useAuth } from "@/context/userContext"
import { useRouter } from 'next/navigation'
import { Alert, AlertTitle } from "@/components/ui/alert"

const FormSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().nonempty("Se requiere contraseña")
}
)
export default function LoginPage() {

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "admin@example.com",
      password: "Admin*2025*"
    },
  })
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const router = useRouter()

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setLoading(true)
    const formData = new FormData()
    formData.append('email', data.email)
    formData.append('password', data.password)
    axios.post(`${process.env.NEXT_PUBLIC_BACKEND_HOST}/auth/login`, formData)
      .then(function (response) {
        if (response.status === 200) {
          login(response.data).then(() => {
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
    <>
      <Alert className="mx-4 sm:mx-auto max-w-6xl border-l-4 border-l-blue-500 bg-blue-50/80 backdrop-blur-sm">

        <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <AlertTitle className="text-blue-800 text-sm font-medium leading-relaxed">
          <div className="grid grid-cols-1 gap-1">
            <div>
              Esta aplicación fue desarrollada para mostrar capacidades técnicas.
              Puede autenticarse como administrador para acceder a todas las funcionalidades.
            </div>
          </div>
        </AlertTitle>
      </Alert>
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
                  Enviar
                </Button>
              </form>
            </Form>
          </CardContent>
          {error && <MyAlert message={error} />}
        </Card>
      </div>
    </>
  )
}