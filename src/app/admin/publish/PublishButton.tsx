"use client";

import { useState, useTransition } from "react";
import { publishDraftAction } from "./actions";

export function PublishButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<
    null | { ok: true } | { ok: false; error: string }
  >(null);

  function onClick() {
    setStatus(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("id", id);
      const result = await publishDraftAction(fd);
      setStatus(
        result.ok
          ? { ok: true }
          : { ok: false, error: result.error || "Failed" },
      );
    });
  }

  if (status?.ok) {
    return (
      <span className="inline-flex items-center rounded-full bg-green-100 px-4 py-2 font-display text-sm uppercase tracking-widest text-green-800">
        Published ✓
      </span>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={onClick}
        disabled={isPending}
        className="rounded-full bg-brand-500 px-5 py-2 font-display text-sm uppercase tracking-widest text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Publishing…" : "Publish"}
      </button>
      {status && !status.ok && (
        <span className="text-xs text-red-600">{status.error}</span>
      )}
    </div>
  );
}
