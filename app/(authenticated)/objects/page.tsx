"use client"

import { useState } from "react"
import { PropertyList } from "@/components/property-list"
import { PropertyFiltersDrawer } from "@/components/property-filters-drawer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PlusIcon, DownloadIcon, SearchIcon, LayoutGridIcon, LayoutListIcon } from "lucide-react"
import Link from "next/link"
import { exportPropertiesToCSV } from "@/lib/export"
import { toast } from "sonner"

export default function ObjectsPage() {
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    rooms: "all",
    district: "",
    minPrice: "",
    maxPrice: "",
    minArea: "",
    maxArea: "",
    sortBy: "none",
  })
  const [viewMode, setViewMode] = useState<"standard" | "large">("standard")

  const handleExport = async () => {
    try {
      const response = await fetch("/api/objects")
      const properties = await response.json()
      exportPropertiesToCSV(properties)
      toast.success("Об'єкти успішно експортовано")
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
              <h1 className="text-3xl font-semibold tracking-tight">Об'єкти недвижимості</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Управління квартирами: додавання, редагування та контакти власників
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExport} className="glass-card ios-hover bg-transparent">
                <DownloadIcon className="size-4 mr-2" />
                Експорт CSV
              </Button>
              <Link href="/objects/new">
                <Button className="ios-hover">
                  <PlusIcon className="size-4 mr-2" />
                  Додати об'єкт
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по ID, адресу, райони..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-9 glass-card"
              />
            </div>

            <div className="flex gap-2">
              <div className="flex gap-1 glass-card rounded-lg p-1">
                <Button
                  variant={viewMode === "standard" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("standard")}
                  className="ios-hover"
                >
                  <LayoutListIcon className="size-4" />
                </Button>
                <Button
                  variant={viewMode === "large" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("large")}
                  className="ios-hover"
                >
                  <LayoutGridIcon className="size-4" />
                </Button>
              </div>

              <PropertyFiltersDrawer filters={filters} onFiltersChange={setFilters} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 container mx-auto px-4 py-6">
        <PropertyList filters={filters} viewMode={viewMode} />
      </div>
    </div>
  )
}
