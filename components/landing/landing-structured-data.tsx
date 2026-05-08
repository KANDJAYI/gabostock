/**
 * JSON-LD structuré pour la landing publique Gabostock — ciblage SEO Gabon.
 *
 * Émet plusieurs blocs schema.org reliés via `@id` :
 *  - Organization / LocalBusiness (Gabostock, Libreville, Gabon)
 *  - WebSite (avec SearchAction sur la home)
 *  - SoftwareApplication (BusinessApplication, prix XAF)
 *  - FAQPage (réutilise les Q/R de la landing pour des rich snippets Google)
 *
 * Ces données aident Google à comprendre que Gabostock est un logiciel SaaS
 * de gestion de stock, ventes et caisse pour les commerces au Gabon.
 */

type FaqItem = { q: string; a: string };

type StructuredDataProps = {
  siteUrl: string;
  faqItems: ReadonlyArray<FaqItem>;
  logoUrl?: string;
};

export function LandingStructuredData({
  siteUrl,
  faqItems,
  logoUrl = "/logogabostock.png",
}: StructuredDataProps) {
  const safeBase = siteUrl.replace(/\/$/, "");
  const absoluteLogo = logoUrl.startsWith("http") ? logoUrl : `${safeBase}${logoUrl}`;

  const organization = {
    "@type": ["Organization", "LocalBusiness"],
    "@id": `${safeBase}/#organization`,
    name: "Gabostock",
    legalName: "Gabostock",
    url: safeBase,
    logo: absoluteLogo,
    image: absoluteLogo,
    description:
      "Logiciel de gestion de stock, ventes, caisse et dépôt pensé pour les commerces, boutiques, supermarchés et pharmacies au Gabon.",
    foundingLocation: {
      "@type": "Place",
      name: "Libreville, Gabon",
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Libreville",
      addressRegion: "Estuaire",
      addressCountry: "GA",
    },
    areaServed: [
      { "@type": "Country", name: "Gabon" },
      { "@type": "City", name: "Libreville" },
      { "@type": "City", name: "Port-Gentil" },
      { "@type": "City", name: "Franceville" },
      { "@type": "City", name: "Owendo" },
      { "@type": "City", name: "Akanda" },
      { "@type": "City", name: "Oyem" },
      { "@type": "City", name: "Lambaréné" },
      { "@type": "City", name: "Mouila" },
      { "@type": "City", name: "Tchibanga" },
      { "@type": "City", name: "Koulamoutou" },
    ],
    knowsLanguage: ["fr", "fr-GA"],
    knowsAbout: [
      "Gestion de stock",
      "Logiciel de caisse",
      "Point de vente",
      "Suivi des ventes",
      "Inventaire",
      "Facturation FCFA",
      "Crédits clients",
      "Dépôt et entrepôt",
      "Multi-magasins",
      "Pharmacie",
      "Commerce au Gabon",
    ],
    sameAs: [] as string[],
  };

  const website = {
    "@type": "WebSite",
    "@id": `${safeBase}/#website`,
    url: safeBase,
    name: "Gabostock",
    inLanguage: "fr-GA",
    publisher: { "@id": `${safeBase}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${safeBase}/?s={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  const softwareApp = {
    "@type": "SoftwareApplication",
    "@id": `${safeBase}/#software`,
    name: "Gabostock",
    alternateName: ["GaboStock", "Gabo Stock"],
    applicationCategory: "BusinessApplication",
    applicationSubCategory: "Inventory & POS Management",
    operatingSystem: "Web, Android, iOS, Windows, macOS",
    description:
      "Application web et mobile (PWA) de gestion de stock, point de vente, créances et entrepôt pour les commerces au Gabon. Fonctionne hors ligne, multi-magasins, factures et tickets en FCFA.",
    url: safeBase,
    image: absoluteLogo,
    inLanguage: "fr-GA",
    countriesSupported: "GA",
    publisher: { "@id": `${safeBase}/#organization` },
    creator: { "@id": `${safeBase}/#organization` },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "XAF",
      availability: "https://schema.org/InStock",
      description: "Essai gratuit pour découvrir Gabostock au Gabon.",
      url: `${safeBase}/register/select-activity`,
    },
    featureList: [
      "Suivi des ventes en temps réel",
      "Gestion de stock multi-magasins",
      "Crédits clients et créances",
      "Suivi des dépenses",
      "Gestion des employés et rôles",
      "Rapports et analyses",
      "Tickets de caisse et factures FCFA",
      "Mode hors ligne (PWA)",
      "Module pharmacie (lots, péremptions)",
      "Codes-barres et impression",
    ],
  };

  const faqPage = {
    "@type": "FAQPage",
    "@id": `${safeBase}/#faq`,
    inLanguage: "fr-GA",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  const graph = {
    "@context": "https://schema.org",
    "@graph": [organization, website, softwareApp, faqPage],
  };

  return (
    <script
      type="application/ld+json"
      // JSON-LD : doit être injecté tel quel dans le HTML.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
