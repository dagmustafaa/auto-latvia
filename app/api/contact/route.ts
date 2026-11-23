import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const topic = String(body.topic || "General").trim();
    const senderName = String(body.senderName || "-").trim();
    const senderEmail = String(body.senderEmail || "").trim();
    const message = String(body.message || "").trim();

    if (!senderEmail || !message) {
      return NextResponse.json({ ok: false, error: "Missing fields" }, { status: 400 });
    }

    const smtpUser = process.env.BREVO_SMTP_USER || "c4bec8001@smtp-brevo.com";
    const smtpPass = process.env.BREVO_SMTP_PASS;
    const targetEmail = "autolatvia.lv@gmail.com";

    if (!smtpPass) {
      return NextResponse.json(
        { ok: false, error: "BREVO_SMTP_PASS is not configured on server" },
        { status: 500 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      secure: false,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    await transporter.sendMail({
      from: `"AutoLatvija Contact" <${targetEmail}>`,
      to: targetEmail,
      replyTo: senderEmail,
      subject: `[AutoLatvija] ${topic} — ${senderName}`,
      text: `Konu / Topic: ${topic}\nGönderen / Name: ${senderName}\nE-posta / Email: ${senderEmail}\n\nMesaj / Message:\n${message}`,
    });

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Mail send error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}