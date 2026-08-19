// Server Component wrapper — page.jsx itself is a Client Component and
// can't export `metadata` (Next only allows that from Server Components).
// This gives /portal its own title instead of inheriting the marketing
// homepage's, and explicitly excludes it from indexing — belt-and-braces
// alongside the robots.txt Disallow in app/robots.js.
export const metadata = {
  title: "Employee Portal | Avaya Udyog",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PortalLayout({ children }) {
  return children;
}
