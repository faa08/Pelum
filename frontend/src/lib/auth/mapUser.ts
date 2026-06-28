import type { User } from "@/backend/authService";
import { DEFAULT_AVATAR } from "@/lib/avatar";

export type UsersRow = {
  id_user: string;
  username: string;
  email: string;
  nama_lengkap?: string | null;
  no_telp?: string | null;
  avatar?: string | null;
  role?: string | null;
  created_at?: string | null;
  tanggal_lahir?: string | null;
};

export function resolveRole(row: UsersRow): User["role"] {
  let role = (row.role as User["role"]) || "customer";
  if (
    row.username === "admin_pelum" ||
    row.username === "admin" ||
    (row.email && row.email.includes("admin@"))
  ) {
    role = "admin";
  }
  return role;
}

export function isAdminUserRow(row: UsersRow): boolean {
  return resolveRole(row) === "admin";
}

export function mapRowToUser(row: UsersRow): User {
  return {
    id_user: row.id_user,
    username: row.username,
    email: row.email,
    nama_lengkap: row.nama_lengkap || row.username,
    no_telp: row.no_telp || "",
    avatar: row.avatar || DEFAULT_AVATAR,
    role: resolveRole(row),
    created_at: row.created_at || new Date().toISOString(),
    tanggal_lahir: row.tanggal_lahir || undefined,
  };
}
