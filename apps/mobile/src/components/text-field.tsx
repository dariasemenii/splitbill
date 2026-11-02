import type { ComponentProps } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

// ComponentProps включає ref (у React 19 ref передається як звичайний проп)
type TextFieldProps = ComponentProps<typeof TextInput> & {
  label?: string;
  error?: string | null;
};

export function TextField({ label, error, style, ref, ...props }: TextFieldProps) {
  const theme = useTheme();

  return (
    <View style={styles.wrapper}>
      {label ? <ThemedText type="smallBold">{label}</ThemedText> : null}
      <TextInput
        ref={ref}
        placeholderTextColor={theme.textSecondary}
        style={[
          styles.input,
          {
            color: theme.text,
            backgroundColor: theme.backgroundElement,
            borderColor: error ? theme.danger : theme.border,
          },
          style,
        ]}
        {...props}
      />
      {error ? <ErrorText>{error}</ErrorText> : null}
    </View>
  );
}

export function ErrorText({ children }: { children: string }) {
  const theme = useTheme();
  return (
    <ThemedText type="small" style={{ color: theme.danger }} accessibilityRole="alert">
      {children}
    </ThemedText>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: Spacing.two },
  input: {
    minHeight: 50,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.three,
    fontSize: 17,
  },
});
