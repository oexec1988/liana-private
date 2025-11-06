import "server-only"
import Database from "better-sqlite3"
import { join } from "path"
import { existsSync, mkdirSync } from "fs"

let db: Database.Database | null = null

export function getDb() {
  if (!db) {
    const dbDir = process.env.DATABASE_DIR || join(process.cwd(), "data")
    const dbPath = process.env.DATABASE_PATH || join(dbDir, "database.sqlite")

    if (!existsSync(dbDir)) {
      mkdirSync(dbDir, { recursive: true })
    }

    db = new Database(dbPath)

    // Enable WAL mode for better concurrent access
    db.pragma("journal_mode = WAL")

    initializeSchema()
  }
  return db
}

function initializeSchema() {
  const db = getDb()

  db.exec(`
    CREATE TABLE IF NOT EXISTS crm_users (
      username TEXT PRIMARY KEY,
      password TEXT NOT NULL,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      role TEXT CHECK(role IN ('admin', 'user')) DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS crm_properties (
      id TEXT PRIMARY KEY,
      address TEXT NOT NULL,
      type TEXT CHECK(type IN ('apartment', 'house')) NOT NULL,
      status TEXT CHECK(status IN ('available', 'reserved', 'sold')) NOT NULL,
      price REAL NOT NULL,
      area REAL NOT NULL,
      rooms INTEGER,
      floor INTEGER,
      total_floors INTEGER,
      owner TEXT,
      owner_phone TEXT,
      description TEXT,
      inventory TEXT,
      has_furniture INTEGER DEFAULT 0,
      photos TEXT,
      main_photo_index INTEGER DEFAULT 0,
      notes TEXT,
      tags TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS crm_clients (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      call_status TEXT CHECK(call_status IN ('not_called', 'reached', 'not_reached')) DEFAULT 'not_called',
      type TEXT CHECK(type IN ('buyer', 'both')) DEFAULT 'buyer',
      status TEXT CHECK(status IN ('active', 'inactive', 'completed')) DEFAULT 'active',
      budget TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS crm_showings (
      id TEXT PRIMARY KEY,
      object_id TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (object_id) REFERENCES crm_properties(id) ON DELETE CASCADE
    )
  `)

  db.exec(`
    CREATE TABLE IF NOT EXISTS crm_admin_actions (
      id TEXT PRIMARY KEY,
      admin_username TEXT NOT NULL,
      action TEXT NOT NULL,
      details TEXT NOT NULL,
      ip_address TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Create indexes for better performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_crm_clients_call_status ON crm_clients(call_status);
    CREATE INDEX IF NOT EXISTS idx_crm_properties_status ON crm_properties(status);
    CREATE INDEX IF NOT EXISTS idx_crm_showings_date ON crm_showings(date);
  `)
}

// Helper function to format price in UAH
export function formatPrice(price: number): string {
  if (price >= 1000000) {
    return `${(price / 1000000).toFixed(1)} млн`
  }
  return price.toLocaleString("uk-UA")
}

// Types
export interface Admin {
  id: number
  username: string
  name: string
  created_at: Date
}

export interface Client {
  id: string
  name: string
  phone: string
  birth_date?: Date
  additional_phones?: string[]
  notes?: string
  call_status: "not_called" | "reached" | "not_reached"
  type: "buyer" | "both"
  status: "active" | "inactive" | "completed"
  budget?: string
  created_at: Date
}

export interface PropertyObject {
  id: number
  address: string
  district?: string
  rooms: number
  area: number
  floor?: number
  total_floors?: number
  price: number
  description?: string
  owner_id?: number
  buyer_id?: number
  status: "available" | "sold" | "has_candidates"
  photos?: string[]
  created_at: Date
  updated_at: Date
  owner?: Client
  buyer?: Client
}

export interface Showing {
  id: number
  object_id: number
  client_id: string
  admin_id?: number
  scheduled_date: Date
  status: "scheduled" | "completed" | "cancelled"
  notes?: string
  created_at: Date
  updated_at: Date
  object?: PropertyObject
  client?: Client
  admin?: Admin
}

export interface Transaction {
  id: number
  type: "income" | "expense"
  amount: number
  description?: string
  client_id?: string
  object_id?: number
  admin_id?: number
  transaction_date: Date
  created_at: Date
}
