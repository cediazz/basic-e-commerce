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
import { useRouter } from 'next/navigation'
import axios from "axios"
import MyAlert from "@/components/Alerts/alert"
import Link from 'next/link'
import { toast } from "sonner"

const FormSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string()
    .min(1, "La contraseña es obligatoria")
    .min(8, "Mínimo 8 caracteres")
    .max(50, "Máximo 50 caracteres")
    .regex(/[A-Z]/, "Al menos una mayúscula")
    .regex(/[a-z]/, "Al menos una minúscula")
    .regex(/[0-9]/, "Al menos un número")
    .regex(/[^a-zA-Z0-9]/, "Al menos un carácter especial (@$!%*?&)"),
  username: z.string().nonempty("Se requiere nombre de usuario"),
  fullname: z.string().nonempty("Se requiere nombre y apellidos")
}
)
export default function RegisterPage() {

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
      password: "",
      username: "",
      fullname: ""
    },
  })
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState('')
  const router = useRouter();

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setLoading(true)
    axios.post(`${process.env.NEXT_PUBLIC_BACKEND_HOST}/users/register`, data)
      .then(function (response) {
        console.log(response.data)
        if (response.status === 201) {
          toast("Usuario registrado exitosamente, ahora puede autenticarse", {
          action: {
            label: "Cerrar",
            onClick: () => console.log("Undo"),
          },
          position:"top-center",
          duration : 5000
        })
          router.push('/login')
        }
        setLoading(false)
      })
      .catch(function (error) {
        if (error.response.data.detail == "REGISTER_USER_ALREADY_EXISTS")
        setError("Ya existe un usuario con el Email proporcionado")
        else
        setError(error.response.data.detail)
        setLoading(false)
      });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
           <CardTitle>Registro</CardTitle>
        <CardDescription>
          Registrate completando el siguiente formulario
        </CardDescription>
        <CardAction>
          <Link href="/login"><Button variant="link">Login</Button></Link>
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
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de usuario</FormLabel>
                    <FormControl>
                      <Input placeholder="nombre de usuario" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fullname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre y apellidos</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre y apellidos" {...field} />
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