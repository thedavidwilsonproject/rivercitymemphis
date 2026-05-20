"use server";

import { revalidatePath } from "next/cache";
import { publishDraft } from "@/lib/publish";

export async function publishDraftAction(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!id) return { ok: false, error: "Missing id" };
  try {
    const result = await publishDraft(id);
    if (!result.ok) {
      return { ok: false, error: "No draft to publish" };
    }
    // Drop in-memory caches for the page that just changed.
    revalidatePath("/");
    revalidatePath(`/${id}`);
    revalidatePath("/admin/publish");
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
