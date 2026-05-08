import { ROUTES } from "@/lib/config/routes";

export function pharmacyLabelForRoute(href: string, fallback: string): string {
  if (href === ROUTES.products) return "Médicaments";
  if (href === ROUTES.inventory) return "Stock (pharma)";
  if (href === ROUTES.sales) return "Ventes (pharma)";
  if (href === ROUTES.stores) return "Points de Vente";
  if (href === ROUTES.suppliers) return "Laboratoires";
  if (href === ROUTES.purchases) return "Achats (pharma)";
  if (href === ROUTES.reports) return "Rapports (pharma)";
  return fallback;
}

export function pharmacySubtitleForScreen(screen: "products" | "inventory" | "sales" | "suppliers"): string {
  switch (screen) {
    case "products":
      return "Médicaments, catégories et laboratoires";
    case "inventory":
      return "Stock, mouvements et alertes de péremption";
    case "sales":
      return "POS et historique des ventes pharmacie";
    case "suppliers":
      return "Gérer vos laboratoires et fournisseurs pharmaceutiques";
    default:
      return "";
  }
}

/** Libellés d’actions (boutons principaux, titres de modales) pour le domaine pharmacie. */
export function pharmacyProductActionLabels(isPharmacy: boolean) {
  return {
    fabNew: isPharmacy ? "Nouveau médicament" : "Nouveau produit",
    fabAria: isPharmacy ? "Nouveau médicament" : "Nouveau produit",
    dialogNewTitle: isPharmacy ? "Nouveau médicament" : "Nouveau produit",
    dialogEditTitle: isPharmacy ? "Modifier le médicament" : "Modifier le produit",
    scopeLabel: isPharmacy ? "Portée du médicament" : "Portée du produit",
    activeCheckbox: isPharmacy ? "Médicament actif" : "Produit actif",
    createSubmit: isPharmacy ? "Créer le médicament" : "Créer",
    updateSubmit: isPharmacy ? "Mettre à jour le médicament" : "Mettre à jour",
    scopeBoth: isPharmacy ? "Dépôt et points de vente" : "Dépôt et boutiques",
    scopeBoutiqueOnly: isPharmacy ? "Points de vente uniquement" : "Boutiques uniquement",
    initialStockPlaceholderBoutique: isPharmacy ? "Quantité pour le point de vente" : "Quantité pour la boutique",
    initialStockPlaceholderNoStore: isPharmacy ? "Choisir un point de vente" : "Choisir une boutique",
    toastSavedCreate: isPharmacy ? "Médicament créé" : "Produit créé",
    toastSavedUpdate: isPharmacy ? "Médicament mis à jour" : "Produit mis à jour",
    toastToggledOn: isPharmacy ? "Médicament activé" : "Produit activé",
    toastToggledOff: isPharmacy ? "Médicament désactivé" : "Produit désactivé",
    toastDeleted: isPharmacy ? "Médicament supprimé" : "Produit supprimé",
    filterChipProductsTab: isPharmacy ? "Médicaments" : "Produits",
    loadListError: isPharmacy
      ? "Impossible de charger les médicaments."
      : "Impossible de charger les produits.",
  } as const;
}

export function pharmacySupplierActionLabels(isPharmacy: boolean) {
  return {
    newButton: isPharmacy ? "Nouveau laboratoire" : "Nouveau fournisseur",
    deleteTitle: isPharmacy ? "Supprimer le laboratoire" : "Supprimer le fournisseur",
    dialogNewTitle: isPharmacy ? "Nouveau laboratoire" : "Nouveau fournisseur",
    dialogEditTitle: isPharmacy ? "Modifier le laboratoire" : "Modifier le fournisseur",
    toastCreated: isPharmacy ? "Laboratoire créé" : "Fournisseur créé",
    toastUpdated: isPharmacy ? "Laboratoire mis à jour" : "Fournisseur mis à jour",
    toastDeleted: isPharmacy ? "Laboratoire supprimé" : "Fournisseur supprimé",
    emptyList: isPharmacy ? "Aucun laboratoire." : "Aucun fournisseur.",
  } as const;
}

export function pharmacyStoreModalLabels(isPharmacy: boolean) {
  return {
    createTitle: isPharmacy ? "Nouveau point de vente" : "Nouvelle boutique",
    editTitle: isPharmacy ? "Modifier le point de vente" : "Modifier la boutique",
    toastCreated: isPharmacy ? "Point de vente créé" : "Boutique créée",
    toastUpdated: isPharmacy ? "Point de vente mis à jour" : "Boutique mise à jour",
    createSubmit: isPharmacy ? "Créer le point de vente" : "Créer",
  } as const;
}

export function pharmacyPurchaseUiLabels(isPharmacy: boolean) {
  return {
    listNewButton: isPharmacy ? "Nouvel achat fournisseur" : "Nouvel achat",
    fieldStore: isPharmacy ? "Point de vente" : "Boutique",
    fieldSupplier: isPharmacy ? "Laboratoire" : "Fournisseur",
    tableStore: isPharmacy ? "Point de vente" : "Boutique",
    tableSupplier: isPharmacy ? "Laboratoire" : "Fournisseur",
    productSelectPlaceholder: isPharmacy ? "Médicament" : "Produit",
    productsLoadError: isPharmacy ? "Erreur chargement médicaments" : "Erreur chargement produits",
    selectStoreSupplierError: isPharmacy
      ? "Sélectionnez un point de vente et un laboratoire."
      : "Sélectionnez une boutique et un fournisseur.",
    createDraftSubmit: isPharmacy ? "Créer l'achat (brouillon)" : "Créer (brouillon)",
    dialogTitle: isPharmacy ? "Nouvel achat fournisseur" : "Nouvel achat",
    toastNoStore: isPharmacy ? "Aucun point de vente." : "Aucune boutique.",
    detailArticlesHeading: isPharmacy ? "Médicaments commandés" : "Articles",
    cancelPurchaseDraft: isPharmacy ? "Annuler la commande fournisseur" : "Annuler l'achat",
  } as const;
}

export function pharmacySalesActionLabels(isPharmacy: boolean) {
  return {
    newSale: isPharmacy ? "Nouvelle vente (pharma)" : "Nouvelle vente",
  } as const;
}

/** Chaînes POS / caisse lorsque le domaine est pharmacie. */
export function pharmacyPosUiLabels(isPharmacy: boolean) {
  return {
    backToStores: isPharmacy ? "Retour aux points de vente" : "Retour aux boutiques",
    saleHistoryAria: isPharmacy
      ? "Historique des ventes de ce point de vente"
      : "Historique des ventes de cette boutique",
    chooseStorePrompt: isPharmacy ? "Choisir un point de vente" : "Choisir une boutique",
    storeNotFound: isPharmacy ? "Point de vente introuvable." : "Boutique introuvable.",
    storeNameFallback: isPharmacy ? "Point de vente" : "Boutique",
    scanSearchPlaceholder: isPharmacy
      ? "Scanner ou rechercher un médicament..."
      : "Scanner ou rechercher un produit...",
    searchProductsPlaceholder: isPharmacy
      ? "Rechercher médicament (nom, SKU, code-barres)..."
      : "Rechercher produit (nom, SKU, code-barres)...",
    noProductsMatch: isPharmacy ? "Aucun médicament" : "Aucun produit",
    noActiveProducts: isPharmacy ? "Aucun médicament actif" : "Aucun produit actif",
    settingsStoreLabel: isPharmacy ? "Point de vente :" : "Boutique :",
    settingsStoreAdminNote: isPharmacy
      ? "Les autres paramètres du point de vente sont gérés par l'administrateur."
      : "Les autres paramètres de la boutique sont gérés par l'administrateur.",
    wrongStoreToast: isPharmacy
      ? "Cette vente appartient à un autre point de vente."
      : "Cette vente appartient à une autre boutique.",
    productFallbackName: isPharmacy ? "Médicament" : "Produit",
    noLotToast: isPharmacy
      ? "Aucun lot disponible pour ce médicament (ajoutez-en dans Lots)."
      : "Aucun lot disponible pour ce produit (ajoutez-en dans Lots).",
    barcodeNotFound: isPharmacy ? "Aucun médicament avec ce code-barres." : "Aucun produit avec ce code-barres.",
    outOfStock: isPharmacy ? "Médicament indisponible (stock épuisé)." : "Produit indisponible (stock épuisé).",
  } as const;
}

