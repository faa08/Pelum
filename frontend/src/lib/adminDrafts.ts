export type DraftMeta = { savedAt: number };

export function saveAdminDraft<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify({ data, savedAt: Date.now() }));
  } catch {
    // ignore quota errors
  }
}

export function loadAdminDraft<T>(key: string): (T & DraftMeta) | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { data: T; savedAt: number };
    if (!parsed?.data) return null;
    return { ...parsed.data, savedAt: parsed.savedAt };
  } catch {
    return null;
  }
}

export function hasAdminDraft(key: string): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(localStorage.getItem(key));
}

export function clearAdminDraft(key: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(key);
}

export function formatDraftTime(savedAt: number): string {
  return new Date(savedAt).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const ADMIN_DRAFT_KEYS = {
  productNew: "pelum_draft_product_new",
  productEdit: (id: string) => `pelum_draft_product_edit_${id}`,
  storeNew: "pelum_draft_store_new",
  storeEdit: (id: string) => `pelum_draft_store_edit_${id}`,
} as const;
