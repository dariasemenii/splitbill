import { Stack } from 'expo-router';

import { useSession } from '@/lib/session';

export default function AppLayout() {
  const { user } = useSession();
  const needsOnboarding = !user?.name;

  return (
    <Stack screenOptions={{ headerBackButtonDisplayMode: 'minimal' }}>
      <Stack.Protected guard={needsOnboarding}>
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Protected guard={!needsOnboarding}>
        <Stack.Screen name="index" options={{ title: 'Мої групи', headerLargeTitle: true }} />
        <Stack.Screen name="groups/new" options={{ title: 'Нова група', presentation: 'modal' }} />
        <Stack.Screen name="groups/[groupId]" options={{ title: '' }} />
      </Stack.Protected>
    </Stack>
  );
}
