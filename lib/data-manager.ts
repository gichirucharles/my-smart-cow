import { getSyncService } from "./sync-service"
import { SecureStorage } from "./secure-storage"

// Base entity interface
export interface BaseEntity {
  id: string
  createdAt: number
  updatedAt: number
  version: number
}

// Generic data manager for any entity type
export class DataManager<T extends BaseEntity> {
  private entityType: string
  private storageKey: string

  constructor(entityType: string) {
    this.entityType = entityType
    this.storageKey = `data_${entityType}`
  }

  // Get all entities
  async getAll(): Promise<T[]> {
    return SecureStorage.getItem<T[]>(this.storageKey, [])
  }

  // Get entity by ID
  async getById(id: string): Promise<T | null> {
    const items = await this.getAll()
    return items.find((item) => item.id === id) || null
  }

  // Create new entity
  async create(data: Omit<T, "id" | "createdAt" | "updatedAt" | "version">): Promise<T> {
    const now = Date.now()
    const id = `${this.entityType}_${now}_${Math.random().toString(36).substring(2, 9)}`

    const newItem: T = {
      ...(data as any),
      id,
      createdAt: now,
      updatedAt: now,
      version: 1,
    }

    const items = await this.getAll()
    const updatedItems = [...items, newItem]

    // Save locally
    SecureStorage.setItem(this.storageKey, updatedItems)

    // Queue for sync
    getSyncService().queueChange({
      id,
      entityType: this.entityType,
      data: newItem,
      timestamp: now,
      operation: "create",
    })

    return newItem
  }

  // Update entity
  async update(id: string, data: Partial<Omit<T, "id" | "createdAt" | "updatedAt" | "version">>): Promise<T | null> {
    const items = await this.getAll()
    const index = items.findIndex((item) => item.id === id)

    if (index === -1) return null

    const now = Date.now()
    const updatedItem: T = {
      ...items[index],
      ...(data as any),
      updatedAt: now,
      version: items[index].version + 1,
    }

    items[index] = updatedItem

    // Save locally
    SecureStorage.setItem(this.storageKey, items)

    // Queue for sync
    getSyncService().queueChange({
      id,
      entityType: this.entityType,
      data: updatedItem,
      timestamp: now,
      operation: "update",
    })

    return updatedItem
  }

  // Delete entity
  async delete(id: string): Promise<boolean> {
    const items = await this.getAll()
    const filteredItems = items.filter((item) => item.id !== id)

    if (filteredItems.length === items.length) {
      return false // Item not found
    }

    // Save locally
    SecureStorage.setItem(this.storageKey, filteredItems)

    // Queue for sync
    getSyncService().queueChange({
      id,
      entityType: this.entityType,
      data: { id },
      timestamp: Date.now(),
      operation: "delete",
    })

    return true
  }

  // Query with simple filters
  async query(filters: Partial<T>): Promise<T[]> {
    const items = await this.getAll()

    return items.filter((item) => {
      for (const [key, value] of Object.entries(filters)) {
        if (item[key as keyof T] !== value) {
          return false
        }
      }
      return true
    })
  }
}

// Create data managers for each entity type
export const cowManager = new DataManager<CowEntity>("cow")
export const milkProductionManager = new DataManager<MilkProductionEntity>("milk")
export const feedManager = new DataManager<FeedEntity>("feed")
export const vetVisitManager = new DataManager<VetVisitEntity>("vet")

// Entity types
export interface CowEntity extends BaseEntity {
  name: string
  tagNumber: string
  breed?: string
  birthDate?: string
  status: "active" | "inactive" | "sold"
}

export interface MilkProductionEntity extends BaseEntity {
  cowId: string
  date: string
  timeOfDay: "morning" | "evening"
  amount: number
}

export interface FeedEntity extends BaseEntity {
  date: string
  type: string
  quantity: number
  cost: number
  bags?: number
}

export interface VetVisitEntity extends BaseEntity {
  cowId: string
  date: string
  reason: string
  cost: number
  notes?: string
}
