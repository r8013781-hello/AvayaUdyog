import Link from "next/link";

// This is the actual fix for the soft-404 problem documented in the
// migration audit: under `output: 'export'`, Next.js writes this to a real
// 404.html at build time. As long as the host doesn't carry over a
// catch-all `/* -> /index.html` rewrite (the old Vite deploy's rule — do
// not reuse it here), unknown paths get a genuine 404 response instead of
// silently rendering the homepage as if it succeeded.
export const metadata = {
  title: "Page not found | Avaya Udyog",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <span className="eyebrow-center">404</span>
      <h1 className="display mt-6 text-[2.4rem] text-ink sm:text-5xl">
        This page doesn&apos;t <span className="accent text-sage-600">exist.</span>
      </h1>
      <p className="mt-5 max-w-md text-[0.98rem] leading-[1.85] text-ink-muted">
        The page you&apos;re looking for may have moved or never existed.
        Head back to the homepage to explore our work.
      </p>
      <Link href="/" className="btn-primary mt-9">
        Back to homepage
      </Link>
    </div>
  );
}
