import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingOrdersList() {
  return (
    <div className="flex items-center justify-center mt-8">
      <div className="space-y-3">
        <Skeleton className="h-4 w-[700px]" />
        <Skeleton className="h-4 w-[700px]" />
        <Skeleton className="h-4 w-[700px]" />
        <Skeleton className="h-4 w-[700px]" />
        <Skeleton className="h-4 w-[700px]" />
      </div>
    </div>
  );
}
