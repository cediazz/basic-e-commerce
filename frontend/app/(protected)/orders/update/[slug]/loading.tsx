import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoadingOrders() {
  return (

    <div className="space-y-3">
      <Skeleton className="h-[300px] rounded-xl" />
      <div className="space-y-3">
        <Skeleton className="h-4" />
        <Skeleton className="h-4" />
        <Skeleton className="h-4" />
      </div>
    </div>

  )
}
