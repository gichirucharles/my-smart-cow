export const SecureStorage = {
  getItem: (key: string, defaultValue: any): any => {
    try {
      // Check if we're in a browser environment
      if (typeof window === "undefined") return defaultValue

      const item = localStorage.getItem(key)
      if (item === null) return defaultValue

      try {
        return JSON.parse(item)
      } catch {
        // If it's not valid JSON, return the raw value
        return item
      }
    } catch (error) {
      console.error(`Error getting item ${key} from storage:`, error)
      return defaultValue
    }
  },

  setItem: (key: string, value: any): void => {
    try {
      // Check if we're in a browser environment
      if (typeof window === "undefined") return

      const valueToStore = typeof value === "string" ? value : JSON.stringify(value)
      localStorage.setItem(key, valueToStore)
    } catch (error) {
      console.error(`Error setting item ${key} in storage:`, error)
    }
  },

  removeItem: (key: string): void => {
    try {
      // Check if we're in a browser environment
      if (typeof window === "undefined") return

      localStorage.removeItem(key)
    } catch (error) {
      console.error(`Error removing item ${key} from storage:`, error)
    }
  },

  // Add a method to check if storage is available
  isAvailable: (): boolean => {
    try {
      if (typeof window === "undefined") return false

      const testKey = "__storage_test__"
      localStorage.setItem(testKey, testKey)
      localStorage.removeItem(testKey)
      return true
    } catch (e) {
      return false
    }
  },
}
