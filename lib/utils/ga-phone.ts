export const GABON_DIAL_CODE = "+241";

function onlyDigits(s: string): string {
  return s.replace(/[^\d]/g, "");
}

/**
 * Normalise un numéro saisi "à la gabonaise" vers E.164.
 * Exemples:
 * - "06223344" -> "+24106223344"
 * - "24106223344" -> "+24106223344"
 * - "+241 06 22 33 44" -> "+24106223344"
 * - "0024106223344" -> "+24106223344"
 *
 * On reste volontairement permissif (pas de validation stricte) : on aide juste l'utilisateur.
 */
export function normalizeGabonPhoneInput(raw: string): string {
  const t = raw.trim();
  if (!t) return "";

  if (t.startsWith("+")) {
    const rest = onlyDigits(t.slice(1));
    return rest ? `+${rest}` : "";
  }

  if (t.startsWith("00")) {
    const rest = onlyDigits(t.slice(2));
    return rest ? `+${rest}` : "";
  }

  const digits = onlyDigits(t);
  if (!digits) return "";

  // Déjà avec 241 sans '+'.
  if (digits.startsWith("241")) return `+${digits}`;

  // Numéro local (souvent 8-9 chiffres) -> préfixe Gabon.
  if (digits.length >= 8 && digits.length <= 9) return `${GABON_DIAL_CODE}${digits}`;

  return digits;
}

