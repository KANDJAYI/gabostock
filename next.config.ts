import type { NextConfig } from "next";

/** Permet un `.env.local` avec seulement `SUPABASE_ANON_KEY` (sans préfixe NEXT_PUBLIC_). */
const supabaseAnonForClient =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
  process.env.SUPABASE_ANON_KEY?.trim() ||
  "";

const nextConfig: NextConfig = {
  env: {
    ...(supabaseAnonForClient
      ? { NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonForClient }
      : {}),
  },
  serverExternalPackages: ["puppeteer-core", "@sparticuz/chromium"],
  /**
   * Sans ceci, le trace Next.js n’embarque pas `node_modules/@sparticuz/chromium/bin/*.br`
   * (non référencés par import) → sur Vercel : « The input directory …/chromium/bin does not exist ».
   * Les clés suivent le chemin App Router normalisé (ex. `app/api/.../route` → `/app/api/...`).
   */
  outputFileTracingIncludes: {
    "/app/api/pdf/**": ["./node_modules/@sparticuz/chromium/**/*"],
  },
  /** Build Vercel : échouer si le typage bloque (détection précoce). */
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
