"use client"

import { ClientForm } from "@/components/client-form"
import { Button } from "@/components/ui/button"
import { ArrowLeftIcon } from "lucide-react"
import Link from "next/link"
import { use, useEffect, useState } from "react"
import { toast } from "sonner"
import type { Client } from "@/lib/data-store"

export default function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadClient = async () => {
      try {
        const response = await fetch(`/api/clients/${id}`)
        if (response.ok) {
          const data = await response.json()
          setClient(data)
        } else {
          toast.error("Клієнт не знайдено")
        }
      } catch (error) {
        console.error("[v0] Load client error:", error)
        toast.error("Помилка завантаження клієнта")
      } finally {
        setLoading(false)
      }
    }

    loadClient()
  }, [id])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <p>Завантаження...</p>
      </div>
    )
  }

  if (!client) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <p className="text-destructive">Клієнт не знайдено</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="mb-6">
        <Link href="/clients">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeftIcon />
            Назад к списку
          </Button>
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">Редактировать клиента {id}</h1>
        <p className="text-sm text-muted-foreground mt-1">Обновите информацию о клиенте</p>
      </div>

      <ClientForm initialData={client} />
    </div>
  )
}
