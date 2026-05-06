import { AppProviders } from "@/components/providers/app-providers";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { RegisterServiceWorker } from "@/components/pwa/register-sw";
import type { Metadata, Viewport } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-roboto",
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Gabostock",
    template: "%s · Gabostock",
  },
  description:
    "Gestion de stock, ventes et dépôt — Gabostock Web (offline-first).",
  applicationName: "Gabostock",
  openGraph: {
    type: "website",
    siteName: "Gabostock",
    title: "Gabostock",
    description: "Gestion de stock, ventes et dépôt — Gabostock Web (offline-first).",
    url: siteUrl,
    images: [{ url: "/logogabostock.png" }],
  },
  twitter: {
    card: "summary",
    title: "Gabostock",
    description: "Gestion de stock, ventes et dépôt — Gabostock Web (offline-first).",
    images: ["/logogabostock.png"],
  },
  /** Favicon & raccourcis : `public/logogabostock.png` */
  icons: {
    icon: [{ url: "/logogabostock.png", type: "image/png" }],
    apple: "/logogabostock.png",
    shortcut: "/logogabostock.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Gabostock",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#0066ff",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${roboto.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-dvh bg-fs-surface font-sans text-fs-text antialiased">
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var k='fs_theme_mode';var m=localStorage.getItem(k);var d=document.documentElement;var dark=false;if(m==='dark'){dark=true;}else if(m==='light'){dark=false;}else{if(m==='system'||m===null){dark=window.matchMedia('(prefers-color-scheme: dark)').matches;}else{dark=false;}}if(dark){d.classList.add('dark');}else{d.classList.remove('dark');}d.setAttribute('data-theme',m||'system');d.style.colorScheme=dark?'dark':'light';}catch(e){}})();`,
          }}
        />
        <AppProviders>
          {children}
          <RegisterServiceWorker />
          <InstallPrompt />
        </AppProviders>
      </body>
    </html>
  );
}
