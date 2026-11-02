import { RequestCodeBody } from '@split/shared';
import { useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { Screen } from '@/components/screen';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { api } from '@/lib/api';
import { errorMessage } from '@/lib/errors';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const requestCode = useMutation({
    mutationFn: (email: string) =>
      api('/api/auth/email/request', { method: 'POST', body: { email }, auth: false }),
    onSuccess: (_data, email) => router.push({ pathname: '/verify', params: { email } }),
    onError: (e) => setError(errorMessage(e)),
  });

  function submit() {
    const parsed = RequestCodeBody.safeParse({ email });
    if (!parsed.success) {
      setError('Введіть коректний email');
      return;
    }
    setError(null);
    requestCode.mutate(parsed.data.email);
  }

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.header}>
        <ThemedText type="subtitle">Split</ThemedText>
        <ThemedText themeColor="textSecondary">
          Діліть спільні витрати з друзями без калькулятора і суперечок.
        </ThemedText>
      </View>

      <TextField
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        textContentType="emailAddress"
        returnKeyType="send"
        onSubmitEditing={submit}
        error={error}
      />

      <Button title="Отримати код" onPress={submit} loading={requestCode.isPending} />

      <ThemedText type="small" themeColor="textSecondary" style={styles.hint}>
        Ми надішлемо 6-значний код на вашу пошту. Пароль не потрібен.
      </ThemedText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: Spacing.two, marginTop: Spacing.six, marginBottom: Spacing.four },
  hint: { textAlign: 'center' },
});
