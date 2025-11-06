"use client"

import { PropertyForm } from "@/components/property-form"
import { Button } from "@/components/ui/button"
import { ArrowLeftIcon } from "lucide-react"
import Link from "next/link"
import { use, useEffect, useState } from "react"
import { toast } from "sonner"
import type { Property } from "@/lib/data-store"

export default function EditObjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProperty = async () => {
      try {
        const response = await fetch(`/api/objects/${id}`)
        if (response.ok) {
          const data = await response.json()
          setProperty(data)
        } else {
          toast.error("Об'єкт не знайдено")
        }
      } catch (error) {
        console.error("[v0] Load property error:", error)
        toast.error("Помилка завантаження об'єкта")
      } finally {
        setLoading(false)
      }
    }

    loadProperty()
  }, [id])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <p>Завантаження...</p>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <p className="text-destructive">Об'єкт не знайдено</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="mb-6">
        <Link href="/objects">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeftIcon />
            Назад к списку
          </Button>
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">Редактировать объект {id}</h1>
        <p className="text-sm text-muted-foreground mt-1">Обновите информацию об объекте</p>
      </div>

      <PropertyForm initialData={property} />
    </div>
  )
}
