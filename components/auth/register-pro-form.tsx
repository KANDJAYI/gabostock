"use client";

import { authSimpleFieldClass } from "@/components/auth/auth-page-shell";
import { authErrorToMessage } from "@/lib/auth/auth-errors";
import { registerSolo } from "@/lib/auth/register-solo";
import { ROUTES } from "@/lib/config/routes";
import { reportHandledClientError } from "@/lib/monitoring/remote-error-logger";
import { createClient } from "@/lib/supabase/client";
import { AlertCircle, FileText } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export function RegisterProForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const hasEnv =
    typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
    process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (fullName.trim().length < 2) {
      setError("Indiquez votre nom (2 caractères minimum).");
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      await registerSolo(supabase, {
        fullName: fullName.trim(),
        email: email.trim(),
        password,
      });
      // La session est active après signUp (si confirmation email désactivée) :
      // on rafraîchit puis on route vers la complétion du profil émetteur.
      router.refresh();
      router.push(ROUTES.facturationProfil);
    } catch (err: unknown) {
      reportHandledClientError(err, { source: "auth:register-pro" });
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "";
      setError(
        msg ? authErrorToMessage({ message: msg }) : "Inscription impossible.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-2xl border border-neutral-200/80 bg-fs-card p-5 shadow-[0_8px_32px_rgba(0,0,0,0.06)] sm:p-6">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-fs-accent/10 text-fs-accent">
            <FileText className="h-8 w-8" aria-hidden />
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-neutral-900 sm:text-[1.65rem]">
            Espace Facturation
          </h1>
          <p className="mt-1 text-sm text-neutral-600 sm:text-[15px]">
            Créez vos devis et factures professionnels, téléchargez-les et
            envoyez-les à vos clients.
          </p>
        </div>

        <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-2.5">
          {!hasEnv ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
              Config Supabase manquante. Ajoutez{" "}
              <code className="rounded bg-fs-card/90 px-1">.env.local</code> puis
              redémarrez le serveur.
            </div>
          ) : null}

          {error ? (
            <div
              className="flex gap-3 rounded-lg border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-950"
              role="alert"
            >
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
              <p>{error}</p>
            </div>
          ) : null}

          <div>
            <label htmlFor="rp-name" className="sr-only">
              Nom complet
            </label>
            <input
              id="rp-name"
              className={authSimpleFieldClass}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              minLength={2}
              autoCapitalize="words"
              autoComplete="name"
              placeholder="Votre nom (ou nom commercial) *"
            />
          </div>

          <div>
            <label htmlFor="rp-email" className="sr-only">
              Email
            </label>
            <input
              id="rp-email"
              className={authSimpleFieldClass}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="Email *"
            />
          </div>

          <div>
            <label htmlFor="rp-password" className="sr-only">
              Mot de passe
            </label>
            <input
              id="rp-password"
              className={authSimpleFieldClass}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="Mot de passe * (min. 8 caractères)"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="fs-touch-target mt-1 flex w-full items-center justify-center rounded-lg bg-fs-accent py-3 text-base font-semibold text-white transition-opacity hover:opacity-[0.96] disabled:opacity-60"
          >
            {loading ? (
              <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              "Créer mon espace facturation"
            )}
          </button>
        </form>

        <div className="mt-4 flex flex-col items-center gap-1.5 text-center text-sm font-semibold text-fs-accent">
          <Link
            href={ROUTES.login}
            className="underline-offset-4 hover:underline"
          >
            Déjà un compte ? Se connecter
          </Link>
          <Link
            href={ROUTES.registerSelectActivity}
            className="text-xs font-semibold text-neutral-500 underline-offset-4 hover:text-fs-accent hover:underline"
          >
            J&apos;ai une entreprise (gestion commerciale) →
          </Link>
        </div>
      </div>
    </div>
  );
}
