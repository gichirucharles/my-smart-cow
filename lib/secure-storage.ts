import CryptoJS from "crypto-js"

// Simple encryption key - in production, use a more secure approach
const ENCRYPTION_KEY = "smart-cow-secure-key-2023"

// Export as default instead of named export
const SecureStorage = {
  // Store encrypted data
  setItem: (key: string, data: any): void => {
    try {
      const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(data), ENCRYPTION_KEY).toString()
      localStorage.setItem(key, encryptedData)
    } catch (error) {
      console.error("Error storing encrypted data:", error)
    }
  },

  // Retrieve and decrypt data - removed generic type parameter
  getItem: (key: string, defaultValue: any): any => {
    try {
      const encryptedData = localStorage.getItem(key)
      if (!encryptedData) return defaultValue

      const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY)
      const decryptedData = decryptedBytes.toString(CryptoJS.enc.Utf8)
      return JSON.parse(decryptedData)
    } catch (error) {
      console.error("Error retrieving encrypted data:", error)
      return defaultValue
    }
  },

  // Remove item
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error("Error removing data:", error)
    }
  },
}

// Export as default
export default SecureStorage
