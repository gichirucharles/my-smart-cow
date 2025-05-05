export const SecureStorage = {
  getItem: (key: string, defaultValue: any): any => {
    try {
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
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Error setting item ${key} in storage:`, error)
    }
  },

  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error(`Error removing item ${key} from storage:`, error)
    }
  },
}
