"use client"

import { useSidebar } from "@/components/context/SidebarContext"
import { DashboardSidebar } from "./DashboardSidebar"
import { cn } from "@/lib/utils"

export default function MobileSidebarWrapper() {
  const { isOpen, setIsOpen } = useSidebar()

  return (
    <>
      {/* Dark Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 md:hidden",
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        )}
        onClick={() => setIsOpen(false)}
      />

      {/* Sliding Panel */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[280px] bg-background transform transition-transform duration-300 ease-in-out md:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <DashboardSidebar isMobile />
      </div>
    </>
  )
}
