"use server";
import { requireUser } from "@/lib/auth";
import { resolveReviewLink, type ResolveResult } from "@/lib/google-resolve";

/** Link do Google Maps → link de avaliação (GOOGLE_PLACES_API_KEY é opcional). */
export async function resolveGoogleLinkAction(raw: string): Promise<ResolveResult> {
  await requireUser();
  if (raw.length > 2000) return { error: "Link grande demais." };
  return resolveReviewLink(raw, process.env.GOOGLE_PLACES_API_KEY || undefined);
}
