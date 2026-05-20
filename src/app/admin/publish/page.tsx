import type { Metadata } from "next";
import Link from "next/link";
import { listPendingDrafts } from "@/lib/publish";
import { PublishButton } from "./PublishButton";

export const metadata: Metadata = {
  title: "Publish drafts — RCC Admin",
  description: "Push pending Sanity drafts to the live site.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function formatTimeAgo(iso?: string): string {
  if (!iso) return "";
  const diffMs = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diffMs / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default async function PublishAdminPage() {
  let drafts: Awaited<ReturnType<typeof listPendingDrafts>> = [];
  let loadError: string | null = null;
  try {
    drafts = await listPendingDrafts();
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Failed to load drafts";
  }

  return (
    <div className="min-h-screen bg-cream-50">
      <header className="border-b border-cream-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-6">
          <div>
            <p className="font-display text-xs uppercase tracking-[0.3em] text-brand-600">
              RCC Admin
            </p>
            <h1 className="mt-1 font-display text-3xl uppercase tracking-wide text-ink-800">
              Publish drafts
            </h1>
          </div>
          <Link
            href="/studio"
            className="rounded-full border border-brand-500 px-5 py-2 font-display text-sm uppercase tracking-widest text-brand-600 transition hover:bg-brand-50"
          >
            Back to Studio
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-10">
        <p className="mb-8 max-w-2xl text-ink-700">
          Every page or document with unpublished changes is listed below.
          Click <strong>Publish</strong> to push it live. Changes show on the
          public site within a minute.
        </p>

        {loadError && (
          <div className="rounded-xl border border-red-300 bg-red-50 p-6 text-red-800">
            <p className="font-display text-sm uppercase tracking-widest">
              Couldn&apos;t load drafts
            </p>
            <p className="mt-2 text-sm">{loadError}</p>
          </div>
        )}

        {!loadError && drafts.length === 0 && (
          <div className="rounded-xl border border-dashed border-ink-300 bg-white p-10 text-center">
            <p className="font-display text-lg uppercase tracking-widest text-ink-500">
              Nothing pending
            </p>
            <p className="mt-2 text-sm text-ink-600">
              When someone edits a page in Studio, the unpublished version
              will show up here.
            </p>
          </div>
        )}

        {!loadError && drafts.length > 0 && (
          <ul className="divide-y divide-cream-200 overflow-hidden rounded-2xl border border-cream-200 bg-white shadow-sm">
            {drafts.map((d) => (
              <li
                key={d.draftId}
                className="flex items-center justify-between gap-4 px-6 py-5"
              >
                <div className="min-w-0">
                  <p className="truncate font-display text-lg uppercase tracking-wide text-ink-800">
                    {d.title}
                  </p>
                  <p className="mt-1 text-xs text-ink-500">
                    {d.type} · last edited {formatTimeAgo(d.updatedAt)}
                  </p>
                </div>
                <PublishButton id={d.publishedId} />
              </li>
            ))}
          </ul>
        )}

        <footer className="mt-12 border-t border-cream-200 pt-6 text-xs text-ink-500">
          <p>
            This page lists every Sanity document with unpublished edits.
            Sanity Studio handles the editing; this page handles the
            publishing.
          </p>
        </footer>
      </main>
    </div>
  );
}
