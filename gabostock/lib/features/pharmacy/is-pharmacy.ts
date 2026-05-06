export function isPharmacyBusinessTypeSlug(slug: string | null | undefined): boolean {
  return (slug ?? "").trim() === "pharmacie";
}

