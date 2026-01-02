"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCookie, deleteCookie } from "cookies-next/client";
import { getData } from "@/utils/getData";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SuccessPaymentPage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [paymentData, setPaymentData] = useState<{
    sessionId: string;
    orderID: string;
  } | null>(null);

  useEffect(() => {
    checkPayment();
  }, []);

  const checkPayment = async () => {
    try {
      // 1. Obtener datos de la cookie
      const cookieData = getCookie("paymentData");

      if (!cookieData) {
        toast.error("No se encontró información de pago");
        router.push("/products");
        return;
      }

      // 2. Parsear los datos
      let parsedData;
      try {
        parsedData =
          typeof cookieData === "string" ? JSON.parse(cookieData) : cookieData;
      } catch (error) {
        console.error("Error parsing cookie data:", error);
        deleteCookie("paymentData");
        router.push("/products");
        return;
      }

      if (!parsedData.sessionId || !parsedData.orderID) {
        toast.error("Datos de pago incompletos");
        deleteCookie("paymentData");
        router.push("/products");
        return;
      }

      setPaymentData(parsedData);

      // 3. Verificar estado del pago
      const data = await getData(
        `/stripe/check-payment/${parsedData.sessionId}`
      );

      if (data === 401 || data === undefined) {
        toast.error("Necesitas iniciar sesión");
        router.push("/login");
        return;
      }

      // 4. Manejar diferentes estados
      if (data.status === "pendiente") {
        toast.warning(
          "El pago aún está pendiente. Por favor, complete el pago en Stripe.",
          {
            duration: 8000,
            position: "top-center",
          }
        );
        setIsChecking(false);
      } else if (data.status === "pagado" || data.status === "paid") {
        deleteCookie("paymentData");

        toast.success(
          "El pago se realizó correctamente y se actualizó la orden.",
          {
            duration: 5000,
            position: "top-center",
          }
        );

        router.push(`/orders/${parsedData.orderID}`);
        return;
      } else {
        // Estado desconocido
        toast.info(`Estado del pago: ${data.status}`, {
          duration: 5000,
        });
        setIsChecking(false);
      }
    } catch (error) {
      console.error("Error checking payment:", error);
      toast.error("Error al verificar el pago");
      setIsChecking(false);
    } finally {
      setIsChecking(false);
    }
  };

  if (isChecking) {
    return (
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
        <h1 className="text-2xl font-semibold">Verificando pago...</h1>
        <p className="text-gray-600">
          Por favor espera mientras confirmamos tu transacción.
        </p>
      </div>
    );
  }

  // UI cuando termina la verificación pero no hay redirección inmediata
  return (
    <div className="flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md p-6">
        {paymentData ? (
          <>
            <div className="mx-auto w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-amber-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold">Pago en proceso</h1>
            <p className="text-gray-600">
              Tu pago está siendo verificado. Serás redirigido automáticamente a
              tu orden.
            </p>
            <Button
              onClick={() => router.push(`/orders/${paymentData.orderID}`)}
              variant="outline"
            >
              Ver mi orden ahora
            </Button>
          </>
        ) : (
          <>
            <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold">No se encontró información</h1>
            <p className="text-gray-600">
              No hay datos de pago para verificar.
            </p>
            <Button onClick={() => router.push("/products")}>
              Volver a productos
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
