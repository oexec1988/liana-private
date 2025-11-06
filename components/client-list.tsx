"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { UsersIcon, EyeIcon, PencilIcon, TrashIcon, PhoneIcon, PhoneOffIcon, CheckIcon } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import type { Client } from "@/lib/data-store"
import { formatPhoneNumber } from "@/lib/format"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ClientListProps {
  filters: {
    search: string
    waiting_for_showing: string
    is_hidden: string
    call_status: string
  }
}

export function ClientList({ filters }: ClientListProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [editingCallStatus, setEditingCallStatus] = useState<string | null>(null)
  const itemsPerPage = 10

  useEffect(() => {
    loadClients()
  }, [filters])

  const loadClients = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()

      if (filters.waiting_for_showing !== "all") {
        params.append("waiting_for_showing", filters.waiting_for_showing)
      }
      if (filters.is_hidden !== "all") {
        params.append("is_hidden", filters.is_hidden)
      }

      const response = await fetch(`/api/clients?${params}`)
      const data = await response.json()
      setClients(data)
    } catch (error) {
      console.error("[v0] Load clients error:", error)
      toast.error("Помилка завантаження клієнтів")
    } finally {
      setLoading(false)
    }
  }

  const filteredClients = clients.filter((client) => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      const matchesSearch =
        client.name.toLowerCase().includes(searchLower) ||
        client.phone.toLowerCase().includes(searchLower) ||
        client.id.toString().includes(searchLower)
      if (!matchesSearch) return false
    }

    if (filters.call_status !== "all" && client.callStatus !== filters.call_status) {
      return false
    }

    return true
  })

  const totalPages = Math.ceil(filteredClients.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedClients = filteredClients.slice(startIndex, startIndex + itemsPerPage)

  const updateCallStatus = async (clientId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callStatus: newStatus }),
      })

      if (response.ok) {
        toast.success("Статус звонка оновлено")
        setEditingCallStatus(null)
        loadClients()
      }
    } catch (error) {
      toast.error("Помилка оновлення статусу")
    }
  }

  const handleDelete = async (clientId: string) => {
    if (!confirm("Ви впевнені, що хочете видалити цього клієнта?")) return

    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Клієнт успішно видалено")
        loadClients()
      } else {
        toast.error("Помилка при видаленні клієнта")
      }
    } catch (error) {
      toast.error("Помилка при видаленні клієнта")
    }
  }

  if (loading) {
    return <Card className="p-8 text-center glass-card">Завантаження...</Card>
  }

  if (filteredClients.length === 0) {
    return (
      <Card className="glass-card">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <UsersIcon />
            </EmptyMedia>
            <EmptyTitle>Клієнти не знайдено</EmptyTitle>
            <EmptyDescription>Спробуйте змінити параметри фільтрації або додайте нового клієнта</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Link href="/clients/new">
              <Button>Додати клієнта</Button>
            </Link>
          </EmptyContent>
        </Empty>
      </Card>
    )
  }

  const getCallStatusBadge = (status: string) => {
    switch (status) {
      case "reached":
        return (
          <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-success/20 text-success rounded">
            <CheckIcon className="size-3" /> Додзвонились
          </span>
        )
      case "not_reached":
        return (
          <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-destructive/20 text-destructive rounded">
            <PhoneOffIcon className="size-3" /> Не додзвонились
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-muted text-muted-foreground rounded">
            <PhoneIcon className="size-3" /> Не телефонували
          </span>
        )
    }
  }

  return (
    <div className="space-y-4">
      <Card className="glass-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>ФІО</TableHead>
              <TableHead>Телефон</TableHead>
              <TableHead>Статус дзвінка</TableHead>
              <TableHead>Дата додавання</TableHead>
              <TableHead>Примітки</TableHead>
              <TableHead className="text-right">Дії</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedClients.map((client) => (
              <TableRow key={client.id}>
                <TableCell className="font-mono text-xs">{client.id}</TableCell>
                <TableCell className="font-medium">{client.name}</TableCell>
                <TableCell className="text-sm">{formatPhoneNumber(client.phone)}</TableCell>
                <TableCell>
                  {editingCallStatus === client.id ? (
                    <Select
                      defaultValue={client.callStatus}
                      onValueChange={(value) => updateCallStatus(client.id, value)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="not_called">Не телефонували</SelectItem>
                        <SelectItem value="reached">Додзвонились</SelectItem>
                        <SelectItem value="not_reached">Не додзвонились</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <button
                      onClick={() => setEditingCallStatus(client.id)}
                      className="inline-block hover:opacity-75 transition"
                    >
                      {getCallStatusBadge(client.callStatus)}
                    </button>
                  )}
                </TableCell>
                <TableCell className="text-sm">{new Date(client.createdAt).toLocaleDateString("uk-UA")}</TableCell>
                <TableCell className="text-sm max-w-xs truncate">{client.notes || "—"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Link href={`/clients/${client.id}`}>
                      <Button variant="ghost" size="icon-sm" className="glass-card">
                        <EyeIcon className="size-4" />
                        <span className="sr-only">Перегляд</span>
                      </Button>
                    </Link>
                    <Link href={`/clients/${client.id}/edit`}>
                      <Button variant="ghost" size="icon-sm" className="glass-card">
                        <PencilIcon className="size-4" />
                        <span className="sr-only">Редагування</span>
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleDelete(client.id)}
                      className="glass-card"
                    >
                      <TrashIcon className="size-4" />
                      <span className="sr-only">Видалення</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => setCurrentPage(page)}
                    isActive={currentPage === page}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      <div className="text-sm text-muted-foreground text-center">
        Показано {startIndex + 1}–{Math.min(startIndex + itemsPerPage, filteredClients.length)} з{" "}
        {filteredClients.length} клієнтів
      </div>
    </div>
  )
}
