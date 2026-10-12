/**
 * Site settings.
 * See README.md for details on each field.
 */
const CONFIG = {
  web3formsKey: "5218bb22-12b7-4359-8caa-596173e93b08", // Web3Forms access key
  whatsapp: "212708282334", // international format, digits only
  email: "contact.mghamraoui@gmail.com",
  calendly: "", // booking link, hidden when empty
  hours: { start: 9, end: 21 }, // availability window, Africa/Casablanca
  showPrices: false,
  currency: "DH",
};

/** Estimator data: price range (DH) and duration (weeks) for a standard scope. */
const NEEDS = {
  site: {
    label: "Site vitrine",
    price: [2000, 5000],
    weeks: [1, 2],
    gets: [
      "Design sur mesure, rapide et mobile",
      "Formulaire de contact relié à votre e-mail",
      "Référencement de base sur Google",
    ],
  },
  app: {
    label: "Application web",
    price: [10000, 30000],
    weeks: [4, 10],
    gets: [
      "Cadrage de l'idée et parcours utilisateur",
      "Application complète, comptes et rôles",
      "Mise en ligne et accompagnement",
    ],
  },
  backoffice: {
    label: "Outil de gestion",
    price: [7000, 22000],
    weeks: [3, 8],
    gets: [
      "Toutes vos données au même endroit",
      "Tableaux de bord et indicateurs en temps réel",
      "Accès différenciés par rôle",
    ],
  },
  auto: {
    label: "Automatisation",
    price: [2000, 9000],
    weeks: [1, 3],
    gets: [
      "Analyse de la tâche à automatiser",
      "E-mails, rapports ou tâches traités automatiquement",
      "Alertes en cas de problème",
    ],
  },
  fix: {
    label: "Amélioration de l'existant",
    price: [1000, 6000],
    weeks: [1, 3],
    gets: [
      "Diagnostic complet de l'outil",
      "Corrections des bugs et lenteurs",
      "Nouvelles fonctionnalités si besoin",
    ],
  },
  other: {
    label: "Projet sur mesure",
    price: null,
    weeks: null,
    gets: [
      "Un premier échange gratuit pour cadrer le besoin",
      "Une proposition adaptée sous 48 h",
      "Un devis fixe, sans engagement",
    ],
  },
};

const SIZES = {
  s: { label: "simple", k: 0.75 },
  m: { label: "standard", k: 1 },
  l: { label: "complet", k: 1.6 },
};

const WHEN = { urgent: "urgent", month: "ce mois-ci", flex: "flexible" };
