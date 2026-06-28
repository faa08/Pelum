type AuthLikeError = {
  message?: string;
  code?: string;
  status?: number;
  error?: string;
  error_description?: string;
};

export function formatSupabaseAuthError(error: AuthLikeError | null | undefined): string {
  if (!error) return "Pendaftaran gagal. Silakan coba lagi.";

  const msg = (error.message || error.error_description || error.error || "").trim();
  const code = error.code?.trim();
  const lower = msg.toLowerCase();

  if (lower.includes("already registered") || code === "user_already_exists") {
    return "Email sudah terdaftar! Silakan masuk atau gunakan email lain.";
  }
  if (lower.includes("rate limit") || code === "over_email_send_rate_limit") {
    return "Terlalu banyak percobaan kirim email. Tunggu 5–10 menit lalu coba lagi.";
  }
  if (lower.includes("password") || code === "weak_password") {
    return "Kata sandi terlalu lemah. Gunakan minimal 8 karakter (huruf + angka).";
  }
  if (lower.includes("redirect") || lower.includes("url") || code === "validation_failed") {
    return "URL callback belum cocok di Supabase. Pastikan /auth/callback sudah ditambahkan di Redirect URLs.";
  }
  if (lower.includes("invalid") && lower.includes("email")) {
    return "Format email tidak valid.";
  }
  if (code === "signup_disabled") {
    return "Pendaftaran dinonaktifkan. Hubungi admin.";
  }

  if (msg && msg !== "{}" && msg !== "[object Object]") return msg;
  if (code) return `Pendaftaran gagal (${code}). Coba lagi atau hubungi admin.`;

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
