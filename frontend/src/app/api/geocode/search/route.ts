import { NextRequest, NextResponse } from "next/server";
import { nominatimHeaders } from "@/lib/nominatim";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 3) {
    return NextResponse.json({ error: "Query minimal 3 karakter." }, { status: 400 });
  }

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", q);
  url.searchParams.set("format", "json");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", "6");
  url.searchParams.set("countrycodes", "id");
  url.searchParams.set("accept-language", "id");

  try {
    const res = await fetch(url.toString(), {
      headers: nominatimHeaders(),
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Pencarian gagal." }, { status: 502 });
    }

    const data = await res.json();
    return NextResponse.json({ results: data });
  } catch {
    return NextResponse.json({ error: "Gagal menghubungi layanan peta." }, { status: 502 });
  }
}
