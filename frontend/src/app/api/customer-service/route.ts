import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { CUSTOMER_SERVICE_SYSTEM_PROMPT } from "@/data/customerServiceKnowledge";

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

function mapGeminiError(err: unknown): string {
  const e = err as { status?: number; message?: string };
  const status = e?.status;
  const msg = e?.message || "";

  if (status === 401 || status === 403 || msg.includes("API key not valid")) {
    return "API key Gemini tidak valid. Periksa GEMINI_API_KEY di .env.local lalu restart server.";
  }
  if (status === 429 || msg.includes("quota") || msg.includes("RESOURCE_EXHAUSTED")) {
    return "Kuota Gemini habis untuk sementara. Tunggu ~1 menit lalu coba lagi.";
  }
  return "Gagal menghubungi AI. Coba lagi sebentar.";
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json(
        { error: "Customer Service AI belum dikonfigurasi. Tambahkan GEMINI_API_KEY di .env.local" },
        { status: 503 }
      );
    }

    const modelName = process.env.GEMINI_MODEL || "gemini-2.0-flash";
    const body = await request.json();
    const messages: ChatMessage[] = body.messages ?? [];

    if (!messages.length || messages[messages.length - 1]?.role !== "user") {
      return NextResponse.json({ error: "Pesan tidak valid" }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: CUSTOMER_SERVICE_SYSTEM_PROMPT,
    });

    const history = messages.slice(0, -1).map((msg) => ({
      role: msg.role === "user" ? ("user" as const) : ("model" as const),
      parts: [{ text: msg.text }],
    }));

    const lastUserText = messages[messages.length - 1].text;
    const chat = model.startChat({ history });
    const result = await chat.sendMessage(lastUserText);
    const reply =
      result.response
        .text()
        ?.trim() ||
      "Maaf, saya tidak dapat memproses permintaan Anda saat ini. Silakan coba lagi.";

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("Customer service API error:", err);
    return NextResponse.json({ error: mapGeminiError(err) }, { status: 502 });
  }
}
