// Réglages d'affaires : modifiez ces valeurs selon votre fonctionnement.
export const SHOP = {
  name: "Saveurs d'Afrique",
  tagline: "Les produits africains de nos épiceries, livrés chez vous partout au Québec",
  contactEmail: "bonjour@exemple.ca",
  // Rythme d'achat affiché aux clients
  purchaseSchedule:
    "Les commandes reçues avant mardi minuit sont achetées le mercredi et expédiées le jeudi.",
};

// Montant minimum de commande (en cents), hors livraison
export const MIN_ORDER_CENTS = 4000;

// Livraison : tarif fixe par zone, gratuite au-delà d'un seuil
export const SHIPPING = {
  quebecCents: 1499,
  canadaCents: 2499,
  freeOverCents: 15000,
  // Provinces desservies. Retirez les codes à exclure (ex. garder seulement "QC").
  provinces: ["QC", "ON", "NB", "NS", "PE", "NL", "MB", "SK", "AB", "BC"] as const,
};

export const PROVINCE_NAMES: Record<string, string> = {
  QC: "Québec",
  ON: "Ontario",
  NB: "Nouveau-Brunswick",
  NS: "Nouvelle-Écosse",
  PE: "Île-du-Prince-Édouard",
  NL: "Terre-Neuve-et-Labrador",
  MB: "Manitoba",
  SK: "Saskatchewan",
  AB: "Alberta",
  BC: "Colombie-Britannique",
};

// Catégorie technique des produits créés pour les demandes spéciales (jamais affichée au catalogue)
export const SPECIAL_CATEGORY = { slug: "demandes-speciales", name: "Demandes spéciales", emoji: "✨" };
