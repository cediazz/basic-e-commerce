"use client"

import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination"
import { BookOpenText, ChevronLeft, ChevronRight } from "lucide-react"
import { Dispatch } from "react";
import { getData } from "@/utils/getData"
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PaginationProps {
  data: any,
  setLoading: Dispatch<boolean>,
  setData: Dispatch<any>
}

export function MyPagination({ data, setLoading, setData }: PaginationProps) {

  const router = useRouter()

  const fetchData = async (url: string) => {
    console.log(url)
    setLoading(true)
    const data = await getData(url)
    if (data === 401) {
      router.push('/login')
    }
    else setData(data)
    setLoading(false)
  }

  return (
    <Pagination className="mt-8">
      <PaginationContent className="flex items-center gap-2">
        {/* Botón Anterior */}
        <PaginationItem>
          <Button
            variant={data.previous ? "default" : "outline"}
            size="sm"
            className={cn(
              "flex items-center gap-2 px-4 py-2 transition-all duration-200",
              "hover:shadow-md hover:scale-105",
              data.previous
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-muted text-muted-foreground cursor-not-allowed opacity-60"
            )}
            disabled={!data.previous}
            onClick={() => data.previous && fetchData(data.previous)}
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>
        </PaginationItem>

        {/* Separador visual */}
        <PaginationItem>
          <div className="flex items-center justify-center w-10 h-10 bg-muted rounded-lg border">
            <BookOpenText className="h-5 w-5 text-muted-foreground" />
          </div>
        </PaginationItem>

        {/* Botón Siguiente */}
        <PaginationItem>
          <Button
            variant={data.next ? "default" : "outline"}
            size="sm"
            className={cn(
              "flex items-center gap-2 px-4 py-2 transition-all duration-200",
              "hover:shadow-md hover:scale-105",
              data.next
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-muted text-muted-foreground cursor-not-allowed opacity-60"
            )}
            disabled={!data.next}
            onClick={() => data.next && fetchData(data.next)}
          >
            Siguiente
            <ChevronRight className="h-4 w-4" />
          </Button>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
