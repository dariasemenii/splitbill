// Форми відповідей API. Дати приходять як ISO-рядки.

export type MemberRole = "OWNER" | "ADMIN" | "MEMBER";

export type PublicUser = {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  defaultCurrency: string;
  createdAt: string;
};

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

export type AuthResponse = TokenPair & {
  user: PublicUser;
  needsOnboarding: boolean;
};

export type GroupSummary = {
  id: string;
  name: string;
  currency: string;
  memberCount: number;
  myMemberId: string;
  myRole: MemberRole;
  createdAt: string;
  updatedAt: string;
};

export type GroupMemberDto = {
  id: string;
  userId: string | null;
  displayName: string;
  role: MemberRole;
};

export type GroupDetail = {
  id: string;
  name: string;
  currency: string;
  createdAt: string;
  myMemberId: string;
  members: GroupMemberDto[];
};

export type ApiErrorBody = {
  error: {
    code: string;
    message?: string;
    issues?: unknown[];
  };
};
