import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const REFRESH_TOKEN_KEY = 'drivique.refresh-token';
const isWeb = Platform.OS === 'web';

export const sessionTokens = {
  getRefreshToken: async (): Promise<string | null> => {
    if (isWeb) {
      try {
        return typeof window !== 'undefined' ? sessionStorage.getItem(REFRESH_TOKEN_KEY) : null;
      } catch (err) {
        console.warn('Error al leer refresh token en sessionStorage:', err);
        return null;
      }
    }
    try {
      return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    } catch (err) {
      console.warn('Error al leer refresh token en SecureStore:', err);
      return null;
    }
  },
  saveRefreshToken: async (token: string): Promise<void> => {
    if (isWeb) {
      try {
        if (typeof window !== 'undefined') sessionStorage.setItem(REFRESH_TOKEN_KEY, token);
      } catch (err) {
        console.warn('Error al persistir refresh token en sessionStorage:', err);
      }
      return;
    }
    try {
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
    } catch (err) {
      console.warn('Error al persistir refresh token en SecureStore:', err);
    }
  },
  clearRefreshToken: async (): Promise<void> => {
    if (isWeb) {
      try {
        if (typeof window !== 'undefined') sessionStorage.removeItem(REFRESH_TOKEN_KEY);
      } catch (err) {
        console.warn('Error al eliminar refresh token en sessionStorage:', err);
      }
      return;
    }
    try {
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    } catch (err) {
      console.warn('Error al eliminar refresh token en SecureStore:', err);
    }
  },
};
