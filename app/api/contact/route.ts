import { NextRequest, NextResponse } from "next/server";
import { contactSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = contactSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: "Data tidak valid", errors: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { nama, email, telepon, pesan } = result.data;

    // TODO: connect to email service (Resend, SendGrid, etc.)
    console.log("[Contact Form]", { nama, email, telepon, pesan });

    return NextResponse.json({ success: true, message: "Pesan Anda telah terkirim" });
  } catch {
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan, silakan coba lagi" },
      { status: 500 }
    );
  }
}
