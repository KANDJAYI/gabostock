/**
 * Vérifie que .env.local contient des valeurs non vides pour Supabase (sans les afficher).
 * Usage : node scripts/verify-env.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const envPath = path.join(root, ".env.local");

if (!fs.existsSync(envPath)) {
  console.error("FAIL: .env.local introuvable à la racine du projet.");
  process.exit(1);
}

let text = fs.readFileSync(envPath, "utf8");
if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
const lines = text.split(/\r?\n/);

/** Parse .env style: KEY=value, optional spaces, optional export, # comments */
function readVar(name) {
  for (const raw of lines) {
    let line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    if (line.startsWith("export ")) line = line.slice(7).trim();
    const eq = line.indexOf("=");
    if (eq < 1) continue;
    const key = line.slice(0, eq).trim();
    if (key !== name) continue;
    let v = line.slice(eq + 1).trim();
    const hash = v.search(/\s+#/);
    if (hash >= 0) v = v.slice(0, hash).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    return v.trim();
  }
  return "";
}

const url = readVar("NEXT_PUBLIC_SUPABASE_URL");
const anon =
  readVar("NEXT_PUBLIC_SUPABASE_ANON_KEY") || readVar("SUPABASE_ANON_KEY");

if (!url || !anon) {
  console.error(
    "FAIL: NEXT_PUBLIC_SUPABASE_URL ou clé anon manquante (utilisez NEXT_PUBLIC_SUPABASE_ANON_KEY ou SUPABASE_ANON_KEY).",
  );
  process.exit(1);
}

if (!/^https?:\/\//i.test(url)) {
  console.error("FAIL: NEXT_PUBLIC_SUPABASE_URL doit commencer par http:// ou https://");
  process.exit(1);
}

if (anon.length < 40) {
  console.error("FAIL: la clé anon semble trop courte (JWT attendu).");
  process.exit(1);
}

console.log("OK: .env.local présent avec URL et clé anon renseignées.");
