export const SecureStorage = {
  getItem: (key: string, defaultValue: any): any => {
    try {
      // Check if we're in a browser environment
      if (typeof window === "undefined") return defaultValue

      const item = localStorage.getItem(key)
      if (item === null) return defaultValue
      return JSON.parse(item)
    } catch (error) {
      console.error(`Error getting item ${key} from storage:`, error)
      return defaultValue
    }
  },

  setItem: (key: string, value: any): void => {
    try {
      // Check if we're in a browser environment
      if (typeof window === "undefined") return

      localStorage.setItem(key, JSON.stringify(value))
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
}
