import { type NextRequest, NextResponse } from "next/server"
import { getDataStore } from "@/lib/data-store"
import { getClientIP } from "@/lib/ip-utils"

export const runtime = "nodejs"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const dataStore = getDataStore()
    const client = dataStore.getClient(params.id)

    if (!client) {
      return NextResponse.json({ error: "Клієнт не знайдено" }, { status: 404 })
    }

    return NextResponse.json(client)
  } catch (error) {
    console.error("[v0] Get client error:", error)
    return NextResponse.json({ error: "Помилка сервера" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await request.json()
    const dataStore = getDataStore()

    const updatedClient = dataStore.updateClient(params.id, {
      name: data.name,
      phone: data.phone,
      callStatus: data.callStatus,
      type: data.type,
      status: data.status,
      budget: data.budget,
      notes: data.notes,
    })

    if (!updatedClient) {
      return NextResponse.json({ error: "Клієнт не знайдено" }, { status: 404 })
    }

    const username = request.headers.get("x-admin-username") || "Unknown"
    const ipAddress = getClientIP(request)

    dataStore.logAdminAction({
      adminUsername: username,
      action: "Оновлено клієнта",
      details: `Клієнт ${data.name} - ${data.phone}`,
      ipAddress,
    })

    return NextResponse.json(updatedClient)
  } catch (error) {
    console.error("[v0] Update client error:", error)
    return NextResponse.json({ error: "Помилка сервера" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const dataStore = getDataStore()
    const client = dataStore.getClient(params.id)

    if (!client) {
      return NextResponse.json({ error: "Клієнт не знайдено" }, { status: 404 })
    }

    dataStore.deleteClient(params.id)

    const username = request.headers.get("x-admin-username") || "Unknown"
    const ipAddress = getClientIP(request)

    dataStore.logAdminAction({
      adminUsername: username,
      action: "Видалено клієнта",
      details: `Клієнт ${client.name} - ${client.phone}`,
      ipAddress,
    })

    return NextResponse.json({ message: "Клієнт успішно видалено" })
  } catch (error) {
    console.error("[v0] Delete client error:", error)
    return NextResponse.json({ error: "Помилка сервера" }, { status: 500 })
  }
}
