import type { CreateGroupInput, GroupDetail, GroupSummary, PublicUser, UpdateMeInput } from '@split/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from './api';
import { useSession } from './session';

export const queryKeys = {
  groups: ['groups'] as const,
  group: (id: string) => ['groups', id] as const,
};

export function useGroups() {
  return useQuery({
    queryKey: queryKeys.groups,
    queryFn: ({ signal }) => api<{ groups: GroupSummary[] }>('/api/groups', { signal }).then((r) => r.groups),
  });
}

export function useGroup(groupId: string) {
  return useQuery({
    queryKey: queryKeys.group(groupId),
    queryFn: ({ signal }) =>
      api<{ group: GroupDetail }>(`/api/groups/${encodeURIComponent(groupId)}`, { signal }).then((r) => r.group),
  });
}

export function useCreateGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateGroupInput) =>
      api<{ group: GroupDetail }>('/api/groups', { method: 'POST', body: input }).then((r) => r.group),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.groups }),
  });
}

export function useUpdateMe() {
  const { setUser } = useSession();
  return useMutation({
    mutationFn: (input: UpdateMeInput) =>
      api<{ user: PublicUser }>('/api/me', { method: 'PATCH', body: input }).then((r) => r.user),
    onSuccess: setUser,
  });
}
