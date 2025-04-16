# Annuaire des délégués territoriaux de l'ANCT

## Description
Cette application web interactive permet aux élus locaux de trouver facilement les coordonnées des délégués territoriaux de l'Agence Nationale de la Cohésion des Territoires (ANCT) dans leur département.

L'ANCT accompagne les territoires dans la concrétisation de projets sur mesure. Si vous êtes un élu et que vous avez un projet de territoire, vous devez contacter le délégué territorial de l'agence présent dans votre département.

## Fonctionnalités
- Carte interactive de France avec les départements
- Recherche de délégués par département
- Affichage des coordonnées complètes des délégués
- Support des départements d'outre-mer

## Structure du projet
```
.
├── css/                 # Styles personnalisés
├── data/               # Données
│   ├── data_contacts.csv    # Coordonnées des délégués
│   ├── geom_dep.geojson     # Géométries des départements
│   └── cercles_drom.geojson # Cercles des DROM
├── img/                # Images et logos
├── lib/                # Bibliothèques externes
│   ├── leaflet*       # Cartographie
│   ├── vue.min.js     # Framework Vue.js
│   ├── d3.min.js      # Manipulation de données
│   └── papaparse.min.js # Parsing CSV
├── src/                # Code source
│   └── app.js         # Logique principale
└── index.html         # Point d'entrée
```

## Technologies utilisées
- Vue.js pour l'interface utilisateur
- Leaflet pour la cartographie interactive
- D3.js pour la manipulation des données
- Papa Parse pour le parsing CSV
- Bootstrap pour le style (CSS uniquement)

## Installation
1. Cloner le repository
```bash
git clone https://github.com/anct-carto/annuaire_delegues_anct.git
```

2. Installer les dépendances
```bash
pnpm install
```

3. Lancer le serveur de développement
```bash
pnpm start
```

## Contribution
Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## Liens utiles
- [Site web de l'ANCT](https://anct.gouv.fr/)
- [Accompagnement de projets sur mesure](https://anct.gouv.fr/laccompagnement-de-projets-sur-mesure-316)
- [Service cartographie ANCT](https://cartotheque.anct.gouv.fr/cartes)

## Licence
Ce projet est sous licence [GNU GENERAL PUBLIC LICENSE](LICENSE).
