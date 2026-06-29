type AuthLikeError = {
  message?: string;
  code?: string;
  status?: number;
  error?: string;
  error_description?: string;
  name?: string;
};

function readAuthErrorFields(error: unknown): {
  msg: string;
  code: string;
  status?: number;
  name: string;
} {
  const e = (error && typeof error === "object" ? error : {}) as AuthLikeError;
  return {
    msg: String(e.message || e.error_description || e.error || "").trim(),
    code: String(e.code || "").trim(),
    status: typeof e.status === "number" ? e.status : undefined,
    name: String(e.name || "").trim(),
  };
}

export function formatSupabaseAuthError(error: unknown): string {
  if (!error) return "Pendaftaran gagal. Silakan coba lagi.";

  const { msg, code, status, name } = readAuthErrorFields(error);
  const lower = msg.toLowerCase();

  if (lower.includes("already registered") || code === "user_already_exists") {
    return "Email sudah terdaftar! Silakan masuk atau gunakan email lain.";
  }
  if (
    lower.includes("rate limit") ||
    code === "over_email_send_rate_limit" ||
    status === 429
  ) {
    return "Terlalu banyak percobaan kirim email. Tunggu 5–10 menit lalu coba lagi.";
  }
  if (
    lower.includes("password") ||
    code === "weak_password" ||
    lower.includes("weak password")
  ) {
    return "Kata sandi terlalu lemah. Gunakan minimal 8 karakter (huruf + angka).";
  }
  if (
    lower.includes("redirect") ||
    lower.includes("url") ||
    code === "validation_failed"
  ) {
    return "URL callback belum cocok di Supabase. Pastikan /auth/callback sudah ditambahkan di Redirect URLs.";
  }
  if (lower.includes("invalid") && lower.includes("email")) {
    return "Format email tidak valid.";
  }
  if (lower.includes("confirmation email") || lower.includes("sending email") || lower.includes("error sending")) {
    return "Akun mungkin sudah dibuat, tapi email verifikasi gagal dikirim (limit SMTP Supabase). Coba masuk langsung, atau hubungi admin untuk verifikasi manual. Untuk production, pasang Custom SMTP di Supabase → Authentication → SMTP Settings.";
  }
  if (lower.includes("database error") || lower.includes("saving new user")) {
    return "Gagal menyimpan akun di database Supabase. Cek trigger/constraint di tabel users atau hubungi admin.";
  }
  if (lower.includes("captcha") || code === "captcha_failed") {
    return "Verifikasi captcha diperlukan. Hubungi admin untuk menonaktifkan captcha di Supabase Auth atau pasang captcha di form.";
  }
  if (lower.includes("email address not authorized")) {
    return "Email tidak diizinkan mendaftar (whitelist Supabase). Gunakan email lain.";
  }
  if (status === 422 && !msg) {
    return "Data tidak valid. Gunakan kata sandi minimal 8 karakter dan email yang belum terdaftar.";
  }
  if (status === 403) {
    return "Pendaftaran ditolak server auth. Periksa pengaturan Supabase Authentication.";
  }

  if (msg && msg !== "{}" && msg !== "[object Object]") return msg;
  if (code) return `Pendaftaran gagal (${code}). Coba lagi atau hubungi admin.`;
  if (status) return `Pendaftaran gagal (HTTP ${status}). Cek Supabase Auth Logs untuk detail.`;
  if (name) return `Pendaftaran gagal (${name}). Coba lagi atau hubungi admin.`;

  return "Pendaftaran gagal. Periksa koneksi atau coba lagi nanti.";
}

export function formatUnknownError(err: unknown, fallback: string): string {
  if (!err) return fallback;
  if (typeof err === "string") {
    const trimmed = err.trim();
    return trimmed && trimmed !== "{}" ? trimmed : fallback;
  }
  if (err instanceof Error) {
    const msg = err.message?.trim();
    if (msg && msg !== "{}" && msg !== "[object Object]") return msg;
  }
  if (typeof err === "object") {
    const o = err as AuthLikeError;
    const formatted = formatSupabaseAuthError(o);
    if (formatted !== "Pendaftaran gagal. Silakan coba lagi.") return formatted;
  }
  return fallback;
}
