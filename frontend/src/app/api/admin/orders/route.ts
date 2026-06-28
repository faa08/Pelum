import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import {
  fetchAdminOrderRows,
  fetchAdminShipmentRows,
  formatDbError,
  mapAdminOrderRow,
  mapAdminShipmentRow,
} from "@/lib/adminOrderMapping";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const view = request.nextUrl.searchParams.get("view") || "orders";

  try {
    if (view === "shipments") {
      const rows = await fetchAdminShipmentRows(auth.ctx.admin);
      const shipments = rows
        .map((row) => mapAdminShipmentRow(row))
        .filter((row): row is NonNullable<typeof row> => row != null);
      return NextResponse.json({ shipments });
    }

    const rows = await fetchAdminOrderRows(auth.ctx.admin);
    const orders = rows.map((row) => mapAdminOrderRow(row));
    return NextResponse.json({ orders });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : formatDbError(err);
    console.error("API admin orders GET failed:", message);
    return NextResponse.json({ error: message || "Gagal memuat pesanan admin." }, { status: 500 });
  }
}
