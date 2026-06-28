export const DEFAULT_AVATAR = "/avatar-default.png";

const LEGACY_MOCK_AVATAR_MARKERS = [
  "images.unsplash.com/photo-1535713875002",
  "images.unsplash.com/photo-1494790108377",
  "images.unsplash.com/photo-1472099645785",
];

/** URL avatar untuk tampilan — fallback ke placeholder generik */
export function resolveAvatarUrl(avatar?: string | null): string {
  const trimmed = avatar?.trim();
  if (!trimmed) return DEFAULT_AVATAR;
  if (LEGACY_MOCK_AVATAR_MARKERS.some((m) => trimmed.includes(m))) return DEFAULT_AVATAR;
  return trimmed;
}

/** Apakah avatar masih placeholder/mock (boleh diganti upload baru) */
export function isGenericAvatar(avatar?: string | null): boolean {
  if (!avatar?.trim()) return true;
  return resolveAvatarUrl(avatar) === DEFAULT_AVATAR;
}
