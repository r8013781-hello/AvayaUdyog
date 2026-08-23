"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Star,
  RefreshCw,
  Eye,
  EyeOff,
  Clock,
  Trash2,
  Plus,
  X,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import { api } from "../../lib/crm/api";
import { useToast, useConfirm } from "../../lib/crm/notifications";

/**
 * Google review moderation. Super-admin only — the server enforces that on
 * every endpoint here, this UI simply isn't offered to anyone else.
 *
 * Nothing reaches the public website until it is explicitly approved from
 * this screen.
 */

const STATUS_COPY = {
  pending: { label: "Awaiting review", tone: "bg-gold-soft text-gold-deep border-gold/40" },
  approved: { label: "Live on website", tone: "bg-sage-100 text-sage-800 border-sage-300" },
  hidden: { label: "Hidden", tone: "bg-sage-50 text-ink-muted border-line-strong" },
};

function Stars({ rating }) {
  // A written testimonial has no star rating. Five faded stars would read as
  // zero, so say plainly that there is no rating instead.
  if (typeof rating !== "number") {
    return (
      <span className="text-[.62rem] font-bold uppercase tracking-label text-ink-faint">
        No rating
      </span>
    );
  }

  return (
    <span className="flex items-center gap-0.5 text-gold" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={13} className={n <= rating ? "fill-current" : "opacity-25"} />
      ))}
    </span>
  );
}

export default function ReviewsPanel() {
  const toast = useToast();
  const confirm = useConfirm();
  const [reviews, setReviews] = useState([]);
  const [google, setGoogle] = useState({ configured: false, missing: [] });
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [filter, setFilter] = useState("all");
  const [showManualForm, setShowManualForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getReviews();
      setReviews(data.reviews || []);
      setGoogle(data.google || { configured: false, missing: [] });
    } catch (err) {
      toast.error({ title: "Couldn't load reviews", message: err.message });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const setStatus = async (review, displayStatus) => {
    try {
      const updated = await api.updateReview(review.id, { displayStatus });
      setReviews((prev) => prev.map((r) => (r.id === review.id ? updated : r)));
      toast.success({
        title: displayStatus === "approved" ? "Published" : "Removed from website",
        message:
          displayStatus === "approved"
            ? `${review.authorName}'s review is now visible on the website.`
            : `${review.authorName}'s review is no longer shown publicly.`,
      });
    } catch (err) {
      toast.error({ title: "Couldn't update review", message: err.message });
    }
  };

  const sync = async () => {
    setSyncing(true);
    try {
      const result = await api.syncGoogleReviews();
      toast.success({
        title: "Synced with Google",
        message: `${result.synced} reviews checked — ${result.inserted} new, ${result.updated} updated.`,
      });
      load();
    } catch (err) {
      toast.error({ title: "Sync failed", message: err.message });
    } finally {
      setSyncing(false);
    }
  };

  const remove = async (review) => {
    const ok = await confirm({
      title: "Delete this review?",
      message: `${review.authorName}'s review will be removed from the CRM. A Google review will reappear on the next sync.`,
      confirmText: "Delete",
    });
    if (!ok) return;
    try {
      await api.deleteReview(review.id);
      setReviews((prev) => prev.filter((r) => r.id !== review.id));
      toast.success({ title: "Review deleted" });
    } catch (err) {
      toast.error({ title: "Couldn't delete review", message: err.message });
    }
  };

  const addManual = async (event) => {
    event.preventDefault();
    const form = new FormData(event.target);
    try {
      const created = await api.createManualReview({
        authorName: form.get("authorName"),
        authorRole: form.get("authorRole") || "",
        // "" means the person never gave a score — send null, don't invent one.
        rating: form.get("rating") ? Number(form.get("rating")) : null,
        text: form.get("text"),
        reviewUrl: form.get("reviewUrl") || "",
      });
      setReviews((prev) => [created, ...prev]);
      setShowManualForm(false);
      toast.success({
        title: "Review added",
        message: "It's saved as awaiting review — approve it to show it on the website.",
      });
    } catch (err) {
      toast.error({ title: "Couldn't add review", message: err.message });
    }
  };

  const visible = filter === "all" ? reviews : reviews.filter((r) => r.displayStatus === filter);
  const approvedCount = reviews.filter((r) => r.displayStatus === "approved").length;
  const pendingCount = reviews.filter((r) => r.displayStatus === "pending").length;

  return (
    <>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="font-display text-3xl">Google reviews</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Choose which reviews appear on the public website. Nothing is shown until you approve it.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowManualForm(true)}
            className="rounded-full border border-line-strong px-4 py-2 text-xs font-bold text-sage-700 transition hover:border-sage-400"
          >
            <Plus size={14} className="mr-1 inline" /> Add manually
          </button>
          <button
            onClick={sync}
            disabled={syncing}
            className="btn-primary !px-5 !py-2.5 disabled:opacity-60"
          >
            <RefreshCw size={14} className={syncing ? "animate-spin" : ""} />
            {syncing ? "Syncing…" : "Sync from Google"}
          </button>
        </div>
      </div>

      {!google.configured && (
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-gold/40 bg-gold-soft/70 p-4">
          <AlertTriangle size={17} className="mt-0.5 shrink-0 text-gold-deep" />
          <div className="text-sm leading-6 text-ink-soft">
            <p className="font-semibold text-ink">Google isn&apos;t connected yet.</p>
            <p className="mt-0.5">
              Automatic sync needs a verified Google Business Profile and approved API access.
              Until then you can add real reviews by hand — they go through the same approval
              step. Missing configuration:{" "}
              <span className="font-mono text-xs">{google.missing.join(", ") || "—"}</span>
            </p>
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {[
          ["all", `All (${reviews.length})`],
          ["pending", `Awaiting review (${pendingCount})`],
          ["approved", `Live on website (${approvedCount})`],
          ["hidden", "Hidden"],
        ].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setFilter(id)}
            className={`rounded-full px-4 py-2 text-xs font-bold transition ${
              filter === id
                ? "bg-sage-800 text-white"
                : "border border-line-strong text-ink-muted hover:text-sage-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="mt-8 text-sm text-ink-muted">Loading reviews…</p>
      ) : !visible.length ? (
        <div className="mt-6 rounded-2xl border border-line bg-white p-10 text-center shadow-hair">
          <p className="text-sm text-ink-muted">
            {reviews.length
              ? "No reviews in this filter."
              : "No reviews yet. Sync from Google, or add one manually."}
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((review) => {
            const status = STATUS_COPY[review.displayStatus];
            return (
              <article
                key={review.id}
                className="flex flex-col rounded-2xl border border-line bg-white p-5 shadow-hair"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{review.authorName}</p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <Stars rating={review.rating} />
                      <span className="text-[.62rem] font-bold uppercase tracking-label text-ink-faint">
                        {review.source}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 rounded-full border px-2.5 py-1 text-[.6rem] font-bold uppercase tracking-label ${status.tone}`}
                  >
                    {status.label}
                  </span>
                </div>

                <p className="mt-4 flex-1 text-sm leading-6 text-ink-soft">
                  {review.text || <span className="italic text-ink-faint">No comment left.</span>}
                </p>

                <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
                  <span className="text-xs text-ink-muted">
                    {review.reviewedAt
                      ? new Date(review.reviewedAt).toLocaleDateString("en-IN")
                      : "—"}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {review.reviewUrl && (
                      <a
                        href={review.reviewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Open original review"
                        className="rounded-lg p-2 text-ink-muted transition hover:bg-sage-50 hover:text-sage-700"
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
                    {review.displayStatus !== "approved" ? (
                      <button
                        onClick={() => setStatus(review, "approved")}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-sage-800 px-3 py-2 text-xs font-bold text-white transition hover:bg-sage-900"
                      >
                        <Eye size={13} /> Show
                      </button>
                    ) : (
                      <button
                        onClick={() => setStatus(review, "hidden")}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-line-strong px-3 py-2 text-xs font-bold text-ink-soft transition hover:border-sage-400"
                      >
                        <EyeOff size={13} /> Hide
                      </button>
                    )}
                    {review.displayStatus === "hidden" && (
                      <button
                        onClick={() => setStatus(review, "pending")}
                        aria-label="Move back to awaiting review"
                        className="rounded-lg p-2 text-ink-muted transition hover:bg-sage-50 hover:text-sage-700"
                      >
                        <Clock size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => remove(review)}
                      aria-label="Delete review"
                      className="rounded-lg p-2 text-red-500 transition hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {showManualForm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-sage-950/45 p-4 backdrop-blur-sm">
          <form onSubmit={addManual} className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-float">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[.62rem] font-bold uppercase tracking-label text-sage-600">
                  Manual entry
                </p>
                <h2 className="mt-1 font-display text-2xl">Add a real review</h2>
                <p className="mt-2 max-w-sm text-xs leading-5 text-ink-muted">
                  Only transcribe reviews a client genuinely left. Link the original where you can
                  — it is what makes the review verifiable.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowManualForm(false)}
                className="rounded-full p-2 text-ink-muted hover:bg-sage-50"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-semibold">
                Reviewer name
                <input
                  name="authorName"
                  required
                  maxLength={150}
                  className="mt-2 w-full rounded-xl border border-line-strong p-3 text-sm outline-none focus:border-sage-500"
                />
              </label>
              <label className="text-sm font-semibold">
                Role <span className="font-normal text-ink-muted">(optional)</span>
                <input
                  name="authorRole"
                  maxLength={100}
                  placeholder="Homeowner"
                  className="mt-2 w-full rounded-xl border border-line-strong p-3 text-sm outline-none focus:border-sage-500"
                />
              </label>
              <label className="text-sm font-semibold">
                Rating
                <select
                  name="rating"
                  defaultValue=""
                  className="mt-2 w-full rounded-xl border border-line-strong p-3 text-sm outline-none focus:border-sage-500"
                >
                  {/* Default to none. Only pick a number if the client
                      actually gave one — a written testimonial has no score,
                      and guessing at 5 fabricates the figure visitors trust
                      most. */}
                  <option value="">No rating given</option>
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {n} star{n > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-semibold sm:col-span-2">
                Link to the original review <span className="font-normal text-ink-muted">(optional)</span>
                <input
                  name="reviewUrl"
                  type="url"
                  placeholder="https://…"
                  className="mt-2 w-full rounded-xl border border-line-strong p-3 text-sm outline-none focus:border-sage-500"
                />
              </label>
              <label className="text-sm font-semibold sm:col-span-2">
                Review text
                <textarea
                  name="text"
                  rows="4"
                  maxLength={4000}
                  className="mt-2 w-full rounded-xl border border-line-strong p-3 text-sm outline-none focus:border-sage-500"
                />
              </label>
            </div>

            <button className="btn-primary mt-6 w-full">Save as awaiting review</button>
          </form>
        </div>
      )}
    </>
  );
}
