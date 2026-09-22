# Prospects Pellets — Jefferco Pellets Grand Est

Outil interne de prospection commerciale. Il liste des industriels et
collectivités susceptibles d'utiliser (ou d'envisager) une chaudière
biomasse/granulés, dans un rayon de 300 km autour de l'usine de Damblain
(Vosges), avec un score de probabilité, le détail des signaux qui le
composent, et une piste de point d'entrée dans chaque structure.

Dépôt dédié, totalement indépendant du site ENMA Formation.

## Démarrer en local

```bash
npm install
cp .env.example .env.local   # puis renseigner PELLETS_ADMIN_PASSWORD
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Comment le score est calculé

Chaque prospect accumule des **signaux** (lauréat BCIAT, lauréat BCIB,
réseau de chaleur à mix biomasse, ICPE en combustion biomasse, IREP,
opération CEE, mention presse, secteur énergivore). Chaque type de signal a
un poids (`lib/types.ts`, `SIGNAL_WEIGHTS`) ; le score est la somme des poids
des signaux distincts détectés, plafonnée à 100. La distance à l'usine
n'entre volontairement pas dans le score : c'est un critère de priorisation
commerciale séparé (filtre dans le tableau de bord), pas un indicateur de
probabilité.

Les poids sont éditables dans `data/prospects.json` (`weights`) — ils ne
sont pas encore modifiables depuis l'interface pour rester simple, mais
changer le fichier suffit.

## D'où viennent les prospects déjà présents

8 prospects réels ont été identifiés par recherche documentaire (pas de
données inventées) et servent de point de départ. Le détail des sources est
visible sur la fiche de chaque prospect. Plusieurs entrées sont marquées
« à vérifier » quand l'information n'a pas pu être confirmée en source
primaire (exploitant exact, mix énergétique précis) — c'est volontaire :
mieux vaut un signal explicitement incertain qu'une donnée inventée.

Points importants à garder en tête en enrichissant la base :

- **BCIAT** (Biomasse Chaleur Industrie Agriculture Tertiaire) est le
  dispositif ADEME le plus direct : lauréat = a déjà investi dans une
  chaudière biomasse. Listes publiées par année sur
  [agirpourlatransition.ademe.fr](https://agirpourlatransition.ademe.fr).
- **BCIB** (Biomasse Chaleur pour l'Industrie du Bois) cible spécifiquement
  les scieries/industries du bois (NAF section C, divisions 16 et 31) pour
  le séchage — très pertinent en Vosges. Les activités de granulation ne
  sont pas éligibles à ce dispositif (donc jamais lauréates elles-mêmes).
- La plupart des réseaux de chaleur « biomasse » fonctionnent aux
  **plaquettes forestières**, pas aux granulés : ce sont des prospects pour
  un usage d'appoint/backup ou pour des petites chaufferies satellites,
  pas nécessairement pour le corps de réseau principal. Le champ
  `currentFuel` de chaque prospect précise ce point quand c'est connu.
- Les fiches **CIBE** (cibe.fr, rubrique « Cahiers du bois-énergie » /
  fiches ADEME « Exemples à suivre ») sont une excellente source : elles
  documentent des installations réelles avec puissance, combustible,
  exploitant, et parfois un contact nommé.

## Pistes pour continuer à peupler la base

Aucun accès payant n'étant disponible, ces sources ouvertes permettent de
continuer la recherche :

- Listes BCIAT / BCIB par année : agirpourlatransition.ademe.fr
- Réseaux de chaleur (traces + mix énergétique) :
  [france-chaleur-urbaine.beta.gouv.fr](https://france-chaleur-urbaine.beta.gouv.fr/reseaux-chaleur)
  et son export data.gouv.fr
- ICPE (installations classées, rubrique 2910 combustion) :
  [Géorisques](https://www.georisques.gouv.fr/)
- IREP (registre des émissions polluantes, combustible déclaré) :
  [irep.ecologie.gouv.fr](https://irep.ecologie.gouv.fr/)
- CIBE — fiches d'installations réelles : [cibe.fr](https://cibe.fr/)
- Marchés publics (signal de projet à venir) : BOAMP, PLACE
- Enrichissement identité (SIRET, effectif) : SIRENE/INSEE, Infogreffe

Un prospect ajouté sans point d'entrée nominatif connu peut recevoir un
lien de recherche préconstruit (LinkedIn, Societe.com) plutôt qu'un nom
inventé — c'est la logique déjà en place pour les prospects du seed.

## Déploiement

Déployé sur Vercel depuis ce dépôt (branche `main`). Variables
d'environnement nécessaires en production : `PELLETS_ADMIN_PASSWORD`,
`GITHUB_TOKEN` (fine-grained, "Contents: Read and write" sur ce dépôt),
`GITHUB_REPOSITORY` (`owner/jefferco-pellets-prospects`), `GITHUB_BRANCH`
(`main`), `GITHUB_BASE_PATH` (vide — ce dépôt est dédié, le projet vit à
la racine).
