import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingProductDetail() {
  return (
    <div className="grid grid-cols-1  lg:grid-cols-2 xl:grid-cols-2 gap-6 mt-8">
      <div className="space-y-3">
        <Skeleton className="h-[300px] w-[250px] rounded-xl" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  );
}
