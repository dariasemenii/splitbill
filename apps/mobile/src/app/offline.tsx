import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { API_URL } from '@/lib/config';
import { useSession } from '@/lib/session';

export default function OfflineScreen() {
  const { retry } = useSession();

  return (
    <Screen edges={['top', 'bottom']} scroll={false}>
      <View style={styles.center}>
        <ThemedText type="subtitle" style={styles.text}>
          Немає з&apos;єднання
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.text}>
          Не вдалося зв&apos;язатися з сервером. Перевірте інтернет і спробуйте ще раз.
        </ThemedText>
        {__DEV__ ? (
          <ThemedText type="code" themeColor="textSecondary" style={styles.text}>
            {API_URL}
          </ThemedText>
        ) : null}
      </View>
      <Button title="Спробувати ще раз" onPress={retry} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', gap: Spacing.three },
  text: { textAlign: 'center' },
});
