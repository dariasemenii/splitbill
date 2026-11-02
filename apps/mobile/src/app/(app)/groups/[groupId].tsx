import type { GroupMemberDto } from '@split/shared';
import { Stack, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/screen';
import { ErrorText } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { errorMessage } from '@/lib/errors';
import { useGroup } from '@/lib/queries';

function MemberRow({ member, isMe }: { member: GroupMemberDto; isMe: boolean }) {
  const theme = useTheme();
  const note = isMe ? 'ви' : member.userId ? null : 'ще не приєднався';

  return (
    <View style={[styles.member, { borderColor: theme.border }]}>
      <ThemedText>{member.displayName}</ThemedText>
      {note ? (
        <ThemedText type="small" themeColor="textSecondary">
          {note}
        </ThemedText>
      ) : null}
    </View>
  );
}

export default function GroupScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const group = useGroup(groupId);

  if (group.isPending) {
    return (
      <Screen scroll={false}>
        <ActivityIndicator style={styles.loader} />
      </Screen>
    );
  }

  if (group.isError) {
    return (
      <Screen scroll={false}>
        <ErrorText>{errorMessage(group.error)}</ErrorText>
      </Screen>
    );
  }

  const { data } = group;

  return (
    <Screen>
      <Stack.Screen options={{ title: data.name }} />

      <View style={styles.section}>
        <ThemedText type="smallBold">Учасники · {data.members.length}</ThemedText>
        <View>
          {data.members.map((member) => (
            <MemberRow key={member.id} member={member} isMe={member.id === data.myMemberId} />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="smallBold">Витрати</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Тут з&apos;являться витрати групи і хто кому скільки винен.
        </ThemedText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loader: { marginTop: Spacing.six },
  section: { gap: Spacing.two },
  member: {
    paddingVertical: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
