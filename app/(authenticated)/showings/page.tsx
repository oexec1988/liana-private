"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, Clock, Trash2, Edit, Plus, MapPinIcon, HomeIcon } from "lucide-react"
import { toast } from "sonner"
import { ShowingsCalendar } from "@/components/showings-calendar"

interface Showing {
  id: string
  objectId: string
  objectAddress?: string
  date: string
  time: string
  notes?: string
}

export default function ShowingsPage() {
  const [showings, setShowings] = useState<Showing[]>([])
  const [objects, setObjects] = useState<any[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingShowing, setEditingShowing] = useState<Showing | null>(null)
  const [formData, setFormData] = useState({
    objectId: "",
    date: "",
    time: "",
    notes: "",
  })

  useEffect(() => {
    loadShowings()
    loadObjects()
  }, [])

  const loadShowings = async () => {
    try {
      const response = await fetch("/api/showings")
      if (response.ok) {
        const data = await response.json()
        setShowings(data)
      }
    } catch (error) {
      console.error("Error loading showings:", error)
      toast.error("Не удалось загрузить показы. Проверьте подключение к серверу.")
    }
  }

  const loadObjects = async () => {
    try {
      const response = await fetch("/api/objects")
      if (response.ok) {
        const data = await response.json()
        setObjects(data)
      }
    } catch (error) {
      console.error("Error loading objects:", error)
      toast.error("Не удалось загрузить объекты. Проверьте подключение к серверу.")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.objectId?.trim() || !formData.date?.trim() || !formData.time?.trim()) {
      toast.error("Заполните все обязательные поля")
      return
    }

    try {
      if (editingShowing) {
        const response = await fetch(`/api/objects/${formData.objectId}/showings/${editingShowing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })

        if (response.ok) {
          toast.success("Показ обновлен")
          loadShowings()
        } else {
          toast.error("Ошибка при обновлении показа")
        }
      } else {
        const response = await fetch(`/api/objects/${formData.objectId}/showings`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })

        if (response.ok) {
          toast.success("Показ создан")
          loadShowings()
        } else {
          toast.error("Ошибка при создании показа")
        }
      }

      setIsDialogOpen(false)
      resetForm()
    } catch (error) {
      toast.error("Ошибка при сохранении показа. Проверьте подключение к серверу.")
    }
  }

  const handleDelete = async (showing: Showing) => {
    if (!confirm("Вы уверены, что хотите удалить этот показ?")) return

    try {
      const response = await fetch(`/api/objects/${showing.objectId}/showings/${showing.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Показ удален")
        loadShowings()
      } else {
        toast.error("Ошибка при удалении показа")
      }
    } catch (error) {
      toast.error("Ошибка при удалении показа. Проверьте подключение к серверу.")
    }
  }

  const handleEdit = (showing: Showing) => {
    setEditingShowing(showing)
    setFormData({
      objectId: showing.objectId,
      date: showing.date,
      time: showing.time,
      notes: showing.notes || "",
    })
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setEditingShowing(null)
    setFormData({
      objectId: "",
      date: "",
      time: "",
      notes: "",
    })
  }

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open)
    if (!open) {
      resetForm()
    }
  }

  const getObjectAddress = (objectId: string) => {
    const object = objects.find((obj) => obj.id === objectId)
    return object?.address || "Адрес не найден"
  }

  const getObjectDistrict = (objectId: string) => {
    const object = objects.find((obj) => obj.id === objectId)
    return object?.district || ""
  }

  const sortedShowings = [...showings].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`)
    const dateB = new Date(`${b.date}T${b.time}`)
    return dateA.getTime() - dateB.getTime()
  })

  const groupedShowings = sortedShowings.reduce(
    (acc, showing) => {
      const date = showing.date
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(showing)
      return acc
    },
    {} as Record<string, Showing[]>,
  )

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.toDateString() === today.toDateString()) {
      return "Сегодня"
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Завтра"
    } else {
      return date.toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long" })
    }
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Показы недвижимости</h1>
          <p className="text-sm text-muted-foreground mt-2">Планирование и управление показами объектов</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button size="lg" className="ios-hover shadow-lg">
              <Plus className="h-5 w-5 mr-2" />
              Добавить показ
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card">
            <DialogHeader>
              <DialogTitle>{editingShowing ? "Редактировать показ" : "Новый показ"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="objectId">
                  Объект <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.objectId}
                  onValueChange={(value) => setFormData({ ...formData, objectId: value })}
                  required
                >
                  <SelectTrigger id="objectId">
                    <SelectValue placeholder="Выберите объект" />
                  </SelectTrigger>
                  <SelectContent>
                    {objects.map((obj) => (
                      <SelectItem key={obj.id} value={obj.id}>
                        {obj.id} - {obj.address}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">
                    Дата <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="time">
                    Время <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Заметки</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  placeholder="Дополнительная информация о показе..."
                />
              </div>

              <div className="flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={() => handleDialogClose(false)}>
                  Отмена
                </Button>
                <Button type="submit">{editingShowing ? "Сохранить" : "Создать"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-8">
        <Card className="glass-card ios-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Календарь показов
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ShowingsCalendar showings={showings} properties={objects} />
          </CardContent>
        </Card>
      </div>

      {sortedShowings.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-primary/10 p-6 mb-4">
              <CalendarIcon className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Нет запланированных показов</h3>
            <p className="text-sm text-muted-foreground mb-6 text-center max-w-md">
              Создайте первый показ, чтобы организовать встречу клиента с объектом недвижимости
            </p>
            <Button onClick={() => setIsDialogOpen(true)} size="lg" className="ios-hover">
              <Plus className="h-5 w-5 mr-2" />
              Добавить показ
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedShowings).map(([date, dateShowings]) => (
            <div key={date} className="space-y-3">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-sm px-3 py-1">
                  {formatDate(date)}
                </Badge>
                <div className="h-px flex-1 bg-border" />
              </div>

              <div className="grid gap-3">
                {dateShowings.map((showing) => (
                  <Card key={showing.id} className="glass-card ios-hover overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="rounded-lg bg-primary/10 p-2 mt-1">
                              <HomeIcon className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-lg mb-1">{getObjectAddress(showing.objectId)}</h4>
                              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <MapPinIcon className="h-4 w-4" />
                                  <span>{getObjectDistrict(showing.objectId) || "Район не указан"}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  <span className="font-medium text-foreground">{showing.time}</span>
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">ID: {showing.objectId}</p>
                            </div>
                          </div>

                          {showing.notes && (
                            <div className="pl-14">
                              <div className="rounded-lg bg-muted/50 p-3">
                                <p className="text-sm text-muted-foreground">{showing.notes}</p>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(showing)} className="ios-hover">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(showing)}
                            className="ios-hover text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
