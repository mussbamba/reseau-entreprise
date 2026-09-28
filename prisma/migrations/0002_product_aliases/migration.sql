-- Autres noms d'un produit (noms locaux, anglais, fautes courantes) pour la recherche
ALTER TABLE "Product" ADD COLUMN "aliases" TEXT NOT NULL DEFAULT '';
