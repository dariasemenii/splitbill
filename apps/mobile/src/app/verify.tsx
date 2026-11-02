import type { AuthResponse } from '@split/shared';
import { useMutation } from '@tanstack/react-query';
import * as Device from 'expo-device';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { Screen } from '@/components/screen';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { api } from '@/lib/api';
import { errorMessage } from '@/lib/errors';
import { useSession } from '@/lib/session';

const RESEND_SECONDS = 60;

export default function VerifyScreen() {
  const { email = '' } = useLocalSearchParams<{ email: string }>();
  const { signIn } = useSession();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendIn]);

  const verify = useMutation({
    mutationFn: (code: string) =>
      api<AuthResponse>('/api/auth/email/verify', {
        method: 'POST',
        auth: false,
        body: { email, code, deviceName: Device.modelName ?? undefined },
      }),
    // Після входу захищені маршрути самі перекинуть на головний екран
    onSuccess: signIn,
    onError: (e) => {
      setError(errorMessage(e));
      setCode('');
    },
  });

  const resend = useMutation({
    mutationFn: () => api('/api/auth/email/request', { method: 'POST', body: { email }, auth: false }),
    onSuccess: () => {
      setError(null);
      setResendIn(RESEND_SECONDS);
    },
    onError: (e) => setError(errorMessage(e)),
  });

  function onChangeCode(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 6);
    setCode(digits);
    if (digits.length === 6 && !verify.isPending) verify.mutate(digits);
  }

  return (
    <Screen>
      <View style={styles.header}>
        <ThemedText type="subtitle">Введіть код</ThemedText>
        <ThemedText themeColor="textSecondary">Ми надіслали його на {email}</ThemedText>
      </View>

      <TextField
        value={code}
        onChangeText={onChangeCode}
        placeholder="000000"
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        maxLength={6}
        autoFocus
        style={styles.codeInput}
        error={error}
        editable={!verify.isPending}
      />

      <Button
        title="Увійти"
        onPress={() => verify.mutate(code)}
        loading={verify.isPending}
        disabled={code.length !== 6}
      />

      <Button
        variant="plain"
        title={resendIn > 0 ? `Надіслати ще раз через ${resendIn} с` : 'Надіслати код ще раз'}
        onPress={() => resend.mutate()}
        disabled={resendIn > 0}
        loading={resend.isPending}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: Spacing.two, marginBottom: Spacing.two },
  codeInput: { fontSize: 28, letterSpacing: 8, textAlign: 'center' },
});
