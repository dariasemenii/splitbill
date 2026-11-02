import type { GroupSummary } from '@split/shared';
import { router } from 'expo-router';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { ErrorText } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { errorMessage } from '@/lib/errors';
import { useGroups } from '@/lib/queries';
import { useSession } from '@/lib/session';

function membersLabel(count: number) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return `${count} учасник`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${count} учасники`;
  return `${count} учасників`;
}

function GroupRow({ group }: { group: GroupSummary }) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push({ pathname: '/groups/[groupId]', params: { groupId: group.id } })}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: pressed ? theme.backgroundSelected : theme.backgroundElement },
      ]}>
      <ThemedText type="smallBold" style={styles.rowTitle}>
        {group.name}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {membersLabel(group.memberCount)} · {group.currency}
      </ThemedText>
    </Pressable>
  );
}

export default function GroupsScreen() {
  const theme = useTheme();
  const { user, signOut } = useSession();
  const groups = useGroups();

  return (
    <SafeAreaView edges={['bottom']} style={[styles.root, { backgroundColor: theme.background }]}>
      <FlatList
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.list}
        data={groups.data ?? []}
        keyExtractor={(g) => g.id}
        renderItem={({ item }) => <GroupRow group={item} />}
        refreshControl={
          <RefreshControl refreshing={groups.isRefetching} onRefresh={() => void groups.refetch()} />
        }
        ListHeaderComponent={
          <ThemedText themeColor="textSecondary">Привіт, {user?.name}!</ThemedText>
        }
        ListEmptyComponent={
          groups.isPending ? (
            <ActivityIndicator style={styles.empty} />
          ) : groups.isError ? (
            <View style={styles.empty}>
              <ErrorText>{errorMessage(groups.error)}</ErrorText>
            </View>
          ) : (
            <View style={styles.empty}>
              <ThemedText type="smallBold">Поки що жодної групи</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Створіть групу для поїздки чи вечірки і додайте друзів.
              </ThemedText>
            </View>
          )
        }
        ListFooterComponent={
          <View style={styles.footer}>
            <Button title="Створити групу" onPress={() => router.push('/groups/new')} />
            <Button variant="plain" title="Вийти" onPress={signOut} />
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  list: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    padding: Spacing.four,
    gap: Spacing.two,
  },
  row: { padding: Spacing.three, borderRadius: 14, gap: Spacing.half },
  rowTitle: { fontSize: 17 },
  empty: { paddingVertical: Spacing.five, gap: Spacing.two, alignItems: 'center' },
  footer: { marginTop: Spacing.four, gap: Spacing.two },
});
