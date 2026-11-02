import { CreateGroupBody } from '@split/shared';
import { router } from 'expo-router';
import { useRef, useState, type ComponentRef } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Button } from '@/components/button';
import { Screen } from '@/components/screen';
import { ErrorText, TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { errorMessage } from '@/lib/errors';
import { useCreateGroup } from '@/lib/queries';

export default function NewGroupScreen() {
  const theme = useTheme();
  const createGroup = useCreateGroup();
  const memberInput = useRef<ComponentRef<typeof TextInput>>(null);

  const [name, setName] = useState('');
  const [memberName, setMemberName] = useState('');
  const [members, setMembers] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  function addMember() {
    const trimmed = memberName.trim();
    if (!trimmed) return;
    if (members.some((m) => m.toLowerCase() === trimmed.toLowerCase())) {
      setError('Такий учасник уже доданий');
      return;
    }
    setError(null);
    setMembers((list) => [...list, trimmed]);
    setMemberName('');
    memberInput.current?.focus();
  }

  function removeMember(index: number) {
    setMembers((list) => list.filter((_, i) => i !== index));
  }

  function submit() {
    const parsed = CreateGroupBody.safeParse({ name, members });
    if (!parsed.success) {
      setError('Вкажіть назву групи');
      return;
    }
    setError(null);
    createGroup.mutate(parsed.data, {
      onSuccess: (group) =>
        router.replace({ pathname: '/groups/[groupId]', params: { groupId: group.id } }),
      onError: (e) => setError(errorMessage(e)),
    });
  }

  return (
    <Screen>
      <TextField
        label="Назва"
        value={name}
        onChangeText={setName}
        placeholder="Наприклад, Карпати 2026"
        returnKeyType="next"
        onSubmitEditing={() => memberInput.current?.focus()}
        autoFocus
      />

      <View style={styles.section}>
        <ThemedText type="smallBold">Учасники</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Ви вже в групі. Додайте друзів за іменем, а пізніше вони зможуть приєднатися за посиланням.
        </ThemedText>

        <View style={styles.addRow}>
          <View style={styles.addInput}>
            <TextField
              ref={memberInput}
              value={memberName}
              onChangeText={setMemberName}
              placeholder="Ім'я друга"
              returnKeyType="done"
              onSubmitEditing={addMember}
              submitBehavior="submit"
            />
          </View>
          <Button variant="secondary" title="Додати" onPress={addMember} disabled={!memberName.trim()} />
        </View>

        {members.length > 0 ? (
          <View style={styles.chips}>
            {members.map((member, index) => (
              <Pressable
                key={member}
                accessibilityRole="button"
                accessibilityLabel={`Прибрати ${member}`}
                onPress={() => removeMember(index)}
                style={[styles.chip, { backgroundColor: theme.backgroundElement }]}>
                <ThemedText type="small">{member}  ✕</ThemedText>
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>

      {error ? <ErrorText>{error}</ErrorText> : null}

      <Button title="Створити" onPress={submit} loading={createGroup.isPending} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { gap: Spacing.two },
  addRow: { flexDirection: 'row', gap: Spacing.two, alignItems: 'flex-start' },
  addInput: { flex: 1 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  chip: { paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, borderRadius: 999 },
});
