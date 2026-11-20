import NextLink from "next/link";

const LINKS = [
  { href: "/feed", label: "Feed" },
  { href: "/faq", label: "FAQ" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div>
        <NextLink className="brand" href="/">outfiter<span>.</span></NextLink>
        <p>Your style, your story.</p>
      </div>
      <nav aria-label="Footer">
        {LINKS.map((link) => (
          <NextLink key={link.href} href={link.href}>{link.label}</NextLink>
        ))}
      </nav>
      <p>© {new Date().getFullYear()} outfiter.</p>
    </footer>
  );
}
