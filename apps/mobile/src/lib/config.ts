import Constants from 'expo-constants';

// Адреса бекенду.
// 1. Якщо задано EXPO_PUBLIC_API_URL (файл .env), використовуємо її.
// 2. У режимі розробки беремо IP комп'ютера, з якого запущено Metro:
//    так працюють і симулятори, і реальний телефон у тій самій Wi-Fi мережі.
function resolveApiUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv) return fromEnv.replace(/\/+$/, '');

  const devHost = Constants.expoConfig?.hostUri?.split(':')[0];
  if (__DEV__ && devHost) return `http://${devHost}:3000`;

  return 'http://localhost:3000';
}

export const API_URL = resolveApiUrl();
