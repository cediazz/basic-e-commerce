"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Upload } from "lucide-react";
import { postProduct } from "@/utils/postProduct";
import { toast } from "sonner"

type ProductFormValues = {
  name: string;
  description: string;
  price: number;
  category: string;
  is_active: boolean;
  image: File;
};

const ProductFormSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre del producto es requerido")
    .max(100, "El nombre no puede tener más de 100 caracteres"),

  description: z
    .string()
    .min(1, "La descripción es requerida")
    .max(500, "La descripción no puede tener más de 500 caracteres"),

  price: z.coerce
    .number({
      required_error: "El precio es requerido",
      invalid_type_error: "El precio debe ser un número válido",
    })
    .min(0.01, "El precio debe ser mayor a 0")
    .max(99999999.99, "El precio no puede ser mayor a 99,999,999.99"),

  category: z.string().min(1, "La categoría es requerida"),

  is_active: z.boolean().default(true),

  image: z
    .instanceof(File, { message: "La imagen del producto es requerida" })
    .refine(
      (file) => file.size <= 1 * 1024 * 1024,
      "La imagen no debe superar 1MB"
    )
    .refine(
      (file) => file.type.startsWith("image/"),
      "Debe ser un archivo de imagen válido"
    ),
});

export default function CreateProductForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState<string>("");

  // Usar el tipo explícito en useForm
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(ProductFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      category: "",
      is_active: true,
      // Para el campo de archivo, no uses undefined, mejor usa un File vacío o maneja el estado por separado
      image: new File([], ""),
    },
  });

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    onChange: (file: File) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      // Crear preview de la imagen
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);

      // Actualizar el valor del formulario
      onChange(file);
      setError("");
    }
  };

  const onSubmit = async (data: ProductFormValues) => {
    setIsLoading(true)
    setError("")
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", data.name);
      formDataToSend.append("description", data.description);
      formDataToSend.append("price", data.price.toString());
      formDataToSend.append("category", data.category);
      formDataToSend.append("is_active", data.is_active.toString());
      formDataToSend.append("image", data.image);
      
      const response = await postProduct("/products/", formDataToSend)
      if (response === 401 || response === undefined) {
        router.push("/login");
      }
      toast(`Producto creado satisfactoriamente`, {
        action: {
          label: "Cerrar",
          onClick: () => console.log("Undo"),
        },
        position: "top-center",
        duration: 5000,
      })
      setIsLoading(false)
    } catch (err) {
      console.error("Error:", err);
      setError(
        err instanceof Error ? err.message : "Error al crear el producto"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crear Nuevo Producto</CardTitle>
        <CardDescription>
          Completa la información del nuevo producto
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Nombre del Producto */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Producto *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ingresa el nombre del producto"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Descripción */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe el producto..."
                      {...field}
                      disabled={isLoading}
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Precio y Categoría en misma fila */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Precio */}
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Categoría */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ingrese la categoría"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Imagen */}
            <FormField
              control={form.control}
              name="image"
              render={({ field: { onChange, value, ...field } }) => (
                <FormItem>
                  <FormLabel>Imagen del Producto *</FormLabel>
                  <FormControl>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, onChange)}
                        disabled={isLoading}
                        className="hidden"
                        id="image-upload"
                        {...field}
                        value="" // Esto es necesario para inputs de tipo file
                      />
                      <label
                        htmlFor="image-upload"
                        className="cursor-pointer flex flex-col items-center gap-2"
                      >
                        <Upload className="h-8 w-8 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {value && value.name
                            ? value.name
                            : "Haz clic para subir una imagen"}
                        </span>
                        <span className="text-xs text-gray-500">
                          PNG, JPG, JPEG hasta 1MB
                        </span>
                      </label>
                    </div>
                  </FormControl>
                  {imagePreview && (
                    <div className="flex items-center justify-center mt-2">
                      <img
                        src={imagePreview}
                        alt="Vista previa"
                        className="h-32 w-50 object-cover rounded-md"
                      />
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Estado Activo */}
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Producto activo</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Botones */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  "Crear Producto"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
