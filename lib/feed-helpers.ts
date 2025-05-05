export interface CowFeedRecord {
  cowId: string
  cowName: string
  date: string
  feedType: string
  quantityKg: number
  mineralGrams: number
}

// Sample data for demonstration
export const sampleCowFeedRecords: CowFeedRecord[] = [
  {
    cowId: "cow1",
    cowName: "Bessie",
    date: new Date().toISOString().split("T")[0],
    feedType: "Hay",
    quantityKg: 12,
    mineralGrams: 250,
  },
  {
    cowId: "cow2",
    cowName: "Daisy",
    date: new Date().toISOString().split("T")[0],
    feedType: "Silage",
    quantityKg: 15,
    mineralGrams: 300,
  },
  {
    cowId: "cow3",
    cowName: "Buttercup",
    date: new Date().toISOString().split("T")[0],
    feedType: "Concentrate",
    quantityKg: 8,
    mineralGrams: 200,
  },
]

export function calculateTotalFeedNeeded(records: CowFeedRecord[]): {
  feedType: string
  totalKg: number
  estimatedBags: number
}[] {
  const feedTypes = new Map<string, { totalKg: number; estimatedBags: number }>()

  records.forEach((record) => {
    const current = feedTypes.get(record.feedType) || { totalKg: 0, estimatedBags: 0 }
    current.totalKg += record.quantityKg
    feedTypes.set(record.feedType, current)
  })

  // Calculate estimated bags (assuming 50kg per bag)
  return Array.from(feedTypes.entries()).map(([feedType, data]) => {
    return {
      feedType,
      totalKg: data.totalKg,
      estimatedBags: Math.ceil(data.totalKg / 50), // Assuming 50kg bags
    }
  })
}
