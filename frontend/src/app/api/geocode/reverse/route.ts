import { NextRequest, NextResponse } from "next/server";
import { nominatimHeaders } from "@/lib/nominatim";

export async function GET(request: NextRequest) {
  const lat = request.nextUrl.searchParams.get("lat");
  const lng = request.nextUrl.searchParams.get("lng");

  if (!lat || !lng) {
    return NextResponse.json({ error: "lat dan lng wajib." }, { status: 400 });
  }

  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("lat", lat);
  url.searchParams.set("lon", lng);
  url.searchParams.set("format", "json");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("zoom", "18");
  url.searchParams.set("accept-language", "id");

  try {
    const res = await fetch(url.toString(), {
      headers: nominatimHeaders(),
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Reverse geocode gagal." }, { status: 502 });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Gagal menghubungi layanan peta." }, { status: 502 });
  }
}
