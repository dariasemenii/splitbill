import * as SecureStore from 'expo-secure-store';

// Refresh-токен живе в Keychain (iOS) / Keystore (Android).
// Access-токен короткоживучий і зберігається лише в пам'яті.
const REFRESH_TOKEN_KEY = 'split.refreshToken';

export const tokenStorage = {
  getRefreshToken: () => SecureStore.getItemAsync(REFRESH_TOKEN_KEY),

  setRefreshToken: (token: string) =>
    SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token, {
      keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
    }),

  clear: () => SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
};
