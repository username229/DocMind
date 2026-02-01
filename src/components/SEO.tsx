import { Helmet } from "react-helmet-async";

type SEOProps = {
  title: string;
  description: string;
  canonical?: string;
  image?: string;
  noindex?: boolean;
  lang?: string;
  alternates?: Array<{ hreflang: string; href: string }>;
};

const SITE_NAME = "DocMind";
const DEFAULT_IMAGE = "https://docmind.co/og.png"; // cria /public/og.png

export function SEO({
  title,
  description,
  canonical,
  image,
  noindex,
  lang,
  alternates,
}: SEOProps) {
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
  const ogImage = image ?? DEFAULT_IMAGE;

  return (
    <Helmet htmlAttributes={{ lang: lang ?? "en" }}>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />

      {/* Canonical */}
      {canonical && <link rel="canonical" href={canonical} />}

      {/* hreflang alternates (multi-idioma) */}
      {alternates?.map((a) => (
        <link key={a.hreflang} rel="alternate" hrefLang={a.hreflang} href={a.href} />
      ))}

      {/* Open Graph */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      {canonical && <meta property="og:url" content={canonical} />}
      <meta property="og:image" content={ogImage} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Robots */}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
    </Helmet>
  );
}
