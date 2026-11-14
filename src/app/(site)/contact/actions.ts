"use server";

import { prisma } from "@/lib/prisma";

export type ContactState = { ok?: boolean; error?: string };

export async function sendContact(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const get = (k: string) => String(formData.get(k) ?? "").trim();
  const name = get("user_name");
  const email = get("user_email");
  const subject = get("subject");
  const message = get("message");
  // honeypot chống spam
  if (get("website")) return { ok: true };
  if (!name || !email || !subject) return { error: "Please fill in all required fields." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Please enter a valid email." };
  if (name.length > 200 || subject.length > 300 || message.length > 5000) return { error: "Your message is too long." };
  try {
    await prisma.contactMessage.create({ data: { name, email, subject, message } });
    return { ok: true };
  } catch {
    return { error: "There was an error trying to send your message. Please try again later." };
  }
}
