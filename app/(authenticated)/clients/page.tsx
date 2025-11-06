"use client"

import { useState } from "react"
import { ClientList } from "@/components/client-list"
import { ClientFilters } from "@/components/client-filters"
import { Button } from "@/components/ui/button"
import { PlusIcon, DownloadIcon } from "lucide-react"
import Link from "next/link"
import { exportClientsToCSV } from "@/lib/export"
import { toast } from "sonner"

export default function ClientsPage() {
  const [filters, setFilters] = useState({
    search: "",
    waiting_for_showing: "all",
    is_hidden: "false",
    call_status: "all",
  })

  const handleExport = async () => {
    try {
      const response = await fetch("/api/clients")
      const clients = await response.json()
      exportClientsToCSV(clients)
      toast.success("Клієнти успішно експортовано")
    } catch (error) {
      console.error("[v0] Export error:", error)
      toast.error("Помилка при експорті")
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-border/50 px-4 py-6">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">Клієнти</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Управління базою клієнтів: контакти, статус дзвінків та примітки
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExport} className="glass-card ios-hover bg-transparent">
                <DownloadIcon className="size-4 mr-2" />
                Експорт CSV
              </Button>
              <Link href="/clients/new">
                <Button className="ios-hover">
                  <PlusIcon className="size-4 mr-2" />
                  Додати клієнта
                </Button>
              </Link>
            </div>
          </div>

          <ClientFilters filters={filters} onFiltersChange={setFilters} />
        </div>
      </div>

      <div className="flex-1 container mx-auto px-4 py-6">
        <ClientList filters={filters} />
      </div>
    </div>
  )
}
