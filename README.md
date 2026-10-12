# mghamraoui4

Site vitrine de mon activité de développeur Full Stack freelance : présentation, simulateur de projet et prise de contact.

Site statique, sans framework ni étape de build, déployé sur GitHub Pages.

En ligne : https://mghamraoui4.github.io/mghamraoui4/

## Stack

- HTML, CSS et JavaScript natifs
- [Web3Forms](https://web3forms.com) pour l'envoi du formulaire de contact
- Polices Geist, Geist Mono et Instrument Serif (Google Fonts)
- Logos techniques : [Devicon](https://devicon.dev) (MIT)

## Structure

```
.
├── index.html
├── 404.html
├── css/styles.css
├── js/
│   ├── config.js     # coordonnées, horaires, données du simulateur
│   └── main.js       # thème, simulateur, animation, formulaire
├── img/
│   ├── photo.jpg / photo.webp
│   ├── og-image.jpg  # aperçu de partage (1200 × 630)
│   └── stack/        # logos des technologies
├── favicon.svg
└── sitemap.xml
```

## Développement local

```bash
python3 -m http.server 8000
# puis http://localhost:8000
```

Formatage : `npx prettier --write .`

## Configuration

Tout se règle dans `js/config.js` :

| Clé            | Rôle                                                              |
| -------------- | ----------------------------------------------------------------- |
| `web3formsKey` | Clé d'accès Web3Forms. Vide : le formulaire bascule sur WhatsApp. |
| `whatsapp`     | Numéro au format international, chiffres uniquement.              |
| `calendly`     | Lien de prise de rendez-vous. Vide : l'option est masquée.        |
| `hours`        | Plage de disponibilité affichée (heure de Casablanca).            |
| `showPrices`   | Affiche ou non les fourchettes de prix dans le simulateur.        |

Les fourchettes de prix et délais du simulateur sont définies dans l'objet `NEEDS`.

### Formulaire de contact

1. Créer une clé sur [web3forms.com](https://web3forms.com) avec l'adresse de réception.
2. La renseigner dans `web3formsKey`.

Chaque demande arrive par e-mail avec l'objet `[Type] Nouvelle demande de <Nom>`, la simulation éventuelle, et l'adresse du client en réponse directe.

## Déploiement

Le dépôt est publié par GitHub Pages depuis la branche `main` (racine). Le fichier `.nojekyll` désactive le traitement Jekyll.

## Licence

Code : tous droits réservés. Logos : propriété de leurs détenteurs respectifs.
