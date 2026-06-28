const NOMINATIM_UA =
  process.env.NOMINATIM_USER_AGENT?.trim() ||
  "PelataranUMKM/1.0 (https://pelataranumkm.id; linkproductive@gmail.com)";

export function nominatimHeaders(): HeadersInit {
  return { "User-Agent": NOMINATIM_UA, Accept: "application/json" };
}
