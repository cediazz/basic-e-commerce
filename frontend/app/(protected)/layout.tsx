import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { CartProvider } from "@/context/cartContext"
import { CartIndicator } from "@/components/Cart/cartIndicator";

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <CartProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <CartIndicator />
            </div>
          </header>
          <div className="container">
            <div className="flex items-center justify-center">
              <main className="w-full max-w-4xl mx-auto space-y-6 py-8">{children}</main>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </CartProvider>
  );
}
