"use client"
import { ListOrdered, Package, ShoppingCart, ClipboardList, ListPlus, PackagePlus} from "lucide-react"
import * as React from "react"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useAuth } from "@/context/userContext"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  
  const { user } = useAuth()

  const getNavItems = () => {
    const baseItems = [
      {
        title: "Productos",
        url: "#",
        icon: Package,
        isActive: true,
        items: [
          {
            title: "Listado de productos",
            url: "/products",
            icon: ClipboardList,
          },
        ],
      },
      {
        title: "Ordenes",
        url: "#",
        icon: ListOrdered,
        items: [
          {
            title: "Crear Orden",
            url: "/orders",
            icon: ListPlus,
          },
          {
            title: "Lista de ordenes",
            url: "/orders/list",
            icon: ListOrdered,
          },
        ],
      },
    ]

    if (user?.is_admin) {
      const productosIndex = baseItems.findIndex(item => item.title === "Productos")
      if (productosIndex !== -1) {
        baseItems[productosIndex].items.push({
          title: "Agregar producto",
          url: "/products/add",
          icon: PackagePlus,
        })
      }
    }

    return baseItems
  }

  const navItems = getNavItems()
  
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <ShoppingCart className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-medium">Ecommerce</span>
                  <span className="">v1.0.0</span>
                </div>
              </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user}/>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
