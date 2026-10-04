import * as SecureStore from 'expo-secure-store'

const REFRESH_TOKEN_KEY = 'drivique.refresh-token'

export const sessionTokens = {
  getRefreshToken: () => SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
  saveRefreshToken: (token: string) => SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token),
  clearRefreshToken: () => SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
}