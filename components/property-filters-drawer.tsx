"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { FilterIcon, XIcon, ArrowUpIcon, ArrowDownIcon } from "lucide-react"
import { useState } from "react"

interface PropertyFiltersDrawerProps {
  filters: {
    search: string
    status: string
    rooms: string
    district: string
    minPrice?: string
    maxPrice?: string
    minArea?: string
    maxArea?: string
    sortBy?: string
  }
  onFiltersChange: (filters: any) => void
}

export function PropertyFiltersDrawer({ filters, onFiltersChange }: PropertyFiltersDrawerProps) {
  const [isOpen, setIsOpen] = useState(false)

  const updateFilter = (key: string, value: string) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const hasActiveFilters =
    filters.search ||
    filters.status !== "all" ||
    filters.rooms !== "all" ||
    filters.district ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.minArea ||
    filters.maxArea ||
    (filters.sortBy && filters.sortBy !== "none")

  const resetFilters = () => {
    onFiltersChange({
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
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="glass-card ios-hover relative bg-transparent">
          <FilterIcon className="size-4 mr-2" />
          Фильтры
          {hasActiveFilters && (
            <span className="absolute -top-1 -right-1 size-3 bg-primary rounded-full animate-pulse" />
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md glass-card overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Фильтры поиска</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* ID Sorting */}
          <div>
            <Label htmlFor="sortBy" className="text-sm font-medium mb-2 block">
              Сортировка по ID
            </Label>
            <Select value={filters.sortBy || "none"} onValueChange={(value) => updateFilter("sortBy", value)}>
              <SelectTrigger id="sortBy">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Без сортировки</SelectItem>
                <SelectItem value="id-asc">
                  <div className="flex items-center gap-2">
                    <ArrowUpIcon className="size-4" />
                    ID: от меньшего к большему
                  </div>
                </SelectItem>
                <SelectItem value="id-desc">
                  <div className="flex items-center gap-2">
                    <ArrowDownIcon className="size-4" />
                    ID: от большего к меньшему
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div>
            <Label htmlFor="status" className="text-sm font-medium mb-2 block">
              Статус
            </Label>
            <Select value={filters.status} onValueChange={(value) => updateFilter("status", value)}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все</SelectItem>
                <SelectItem value="available">Свободна</SelectItem>
                <SelectItem value="reserved">Зарезервирована</SelectItem>
                <SelectItem value="sold">Продана</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Rooms */}
          <div>
            <Label htmlFor="rooms" className="text-sm font-medium mb-2 block">
              Комнаты
            </Label>
            <Select value={filters.rooms} onValueChange={(value) => updateFilter("rooms", value)}>
              <SelectTrigger id="rooms">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все</SelectItem>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="4">4+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* District */}
          <div>
            <Label htmlFor="district" className="text-sm font-medium mb-2 block">
              Район
            </Label>
            <Input
              id="district"
              placeholder="Введите район..."
              value={filters.district}
              onChange={(e) => updateFilter("district", e.target.value)}
            />
          </div>

          {/* Price Range */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Диапазон цен (₴)</Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Input
                  type="number"
                  placeholder="От"
                  value={filters.minPrice || ""}
                  onChange={(e) => updateFilter("minPrice", e.target.value)}
                />
              </div>
              <div>
                <Input
                  type="number"
                  placeholder="До"
                  value={filters.maxPrice || ""}
                  onChange={(e) => updateFilter("maxPrice", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Area Range */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Площадь (м²)</Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Input
                  type="number"
                  placeholder="От"
                  value={filters.minArea || ""}
                  onChange={(e) => updateFilter("minArea", e.target.value)}
                />
              </div>
              <div>
                <Input
                  type="number"
                  placeholder="До"
                  value={filters.maxArea || ""}
                  onChange={(e) => updateFilter("maxArea", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Reset Button */}
          <Button
            variant="outline"
            onClick={resetFilters}
            disabled={!hasActiveFilters}
            className="w-full glass-card ios-hover bg-transparent"
          >
            <XIcon className="size-4 mr-2" />
            Сбросить все фильтры
          </Button>

          {/* Apply Button */}
          <Button onClick={() => setIsOpen(false)} className="w-full">
            Применить фильтры
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
