import { UpdateMeBody } from '@split/shared';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { Screen } from '@/components/screen';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { errorMessage } from '@/lib/errors';
import { useUpdateMe } from '@/lib/queries';

export default function OnboardingScreen() {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const updateMe = useUpdateMe();

  function submit() {
    const parsed = UpdateMeBody.safeParse({ name });
    if (!parsed.success || !parsed.data.name) {
      setError("Введіть ім'я");
      return;
    }
    setError(null);
    // Після збереження імені захищені маршрути самі відкриють список груп
    updateMe.mutate({ name: parsed.data.name }, { onError: (e) => setError(errorMessage(e)) });
  }

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.header}>
        <ThemedText type="subtitle">Як вас звати?</ThemedText>
        <ThemedText themeColor="textSecondary">Так вас бачитимуть друзі у спільних групах.</ThemedText>
      </View>

      <TextField
        label="Ім'я"
        value={name}
        onChangeText={setName}
        placeholder="Наприклад, Оля"
        autoComplete="name"
        textContentType="givenName"
        returnKeyType="done"
        onSubmitEditing={submit}
        autoFocus
        error={error}
      />

      <Button title="Продовжити" onPress={submit} loading={updateMe.isPending} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: Spacing.two, marginTop: Spacing.six, marginBottom: Spacing.four },
});
