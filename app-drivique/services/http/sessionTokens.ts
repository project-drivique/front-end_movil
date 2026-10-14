import { Platform } from 'react-native'
import * as SecureStore from 'expo-secure-store'

const REFRESH_TOKEN_KEY = 'drivique.refresh-token'
const isWeb = Platform.OS === 'web'

export const sessionTokens = {
  getRefreshToken: async (): Promise<string | null> => {
    if (isWeb) {
      try {
        return typeof window !== 'undefined' ? localStorage.getItem(REFRESH_TOKEN_KEY) : null
      } catch {
        return null
      }
    }
    try {
      return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY)
    } catch {
      return null
    }
  },
  saveRefreshToken: async (token: string): Promise<void> => {
    if (isWeb) {
      try {
        if (typeof window !== 'undefined') localStorage.setItem(REFRESH_TOKEN_KEY, token)
      } catch {}
      return
    }
    try {
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token)
    } catch {}
  },
  clearRefreshToken: async (): Promise<void> => {
    if (isWeb) {
      try {
        if (typeof window !== 'undefined') localStorage.removeItem(REFRESH_TOKEN_KEY)
      } catch {}
      return
    }
    try {
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY)
    } catch {}
  },
}