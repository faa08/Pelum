/** Ambil bagian display_name Nominatim dari belakang (format umum Indonesia). */
function parseDisplayNameFallback(displayName: string) {
  const parts = displayName
    .split(",")
    .map((p) => p.trim())
    .filter((p) => p && p !== "Indonesia" && !/^\d{5}$/.test(p))
    .filter((p) => !["Jawa", "Sumatera", "Kalimantan", "Sulawesi", "Papua", "Bali", "Nusa Tenggara"].includes(p));

  if (parts.length < 2) {
    return { provinsi: "", kota: "", kecamatan: "", detail_alamat: displayName.split(",")[0]?.trim() || "" };
  }

  const provinsi = parts[parts.length - 1] || "";
  const kota = parts[parts.length - 2] || "";
  const kecamatan = parts.length >= 3 ? parts[parts.length - 3] : "";
  const detail = parts.slice(0, Math.max(0, parts.length - 3)).join(", ");

  return { provinsi, kota, kecamatan, detail_alamat: detail };
}

/** Parse komponen alamat dari respons Nominatim (OpenStreetMap) — dioptimalkan untuk Indonesia. */
export function parseOsmAddress(
  address: Record<string, string>,
  displayName?: string
) {
  const fallback = displayName ? parseDisplayNameFallback(displayName) : null;

  let provinsi =
    address.state ||
    address.province ||
    address.region ||
    "";

  if (address["ISO3166-2-lvl4"] === "ID-JK") {
    provinsi = "DKI Jakarta";
  }

  const kota =
    address.city ||
    address.county ||
    address.town ||
    address.municipality ||
    "";

  const kecamatan =
    address.suburb ||
    address.city_district ||
    address.district ||
    address.state_district ||
    address.borough ||
    "";

  const kode_pos = address.postcode || "";

  const detailParts = [
    address.road,
    address.house_number,
    address.building,
    address.neighbourhood,
    address.hamlet,
    address.village,
    address.industrial,
    address.man_made,
  ].filter(Boolean);

  const detailFromParts = [...new Set(detailParts)].join(", ");

  return {
    provinsi: provinsi || fallback?.provinsi || "",
    kota: kota || fallback?.kota || "",
    kecamatan: kecamatan || address.village || fallback?.kecamatan || "",
    kode_pos: kode_pos || (displayName?.match(/\b(\d{5})\b/)?.[1] ?? ""),
    detail_alamat:
      detailFromParts ||
      fallback?.detail_alamat ||
      displayName?.split(",")[0]?.trim() ||
      "",
  };
}
