import fs from "node:fs";
import path from "node:path";

const SITE_URL = "https://docmind.co";

// Rotas REAIS do teu App.tsx
const ROUTES = [
  { path: "/", index: true },

  // privadas / auth (não entram no sitemap)
  { path: "/auth", index: false },
  { path: "/dashboard", index: false },
  { path: "/dashboard/new", index: false },
  { path: "/dashboard/document/:id", index: false }, // dinâmica
];

function xmlEscape(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function buildSitemap() {
  const now = new Date().toISOString().split("T")[0];

  const urls = ROUTES
    .filter((r) => r.index && r.path === "/") // hoje: só indexa a home
    .map((r) => {
      const loc = `${SITE_URL}${r.path === "/" ? "" : r.path}`;
      return `
  <url>
    <loc>${xmlEscape(loc)}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>`.trimEnd();
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

function buildRobots() {
  return `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;
}

const publicDir = path.join(process.cwd(), "public");
fs.mkdirSync(publicDir, { recursive: true });

fs.writeFileSync(path.join(publicDir, "sitemap.xml"), buildSitemap(), "utf8");
fs.writeFileSync(path.join(publicDir, "robots.txt"), buildRobots(), "utf8");

console.log("✅ Generated public/sitemap.xml and public/robots.txt");
