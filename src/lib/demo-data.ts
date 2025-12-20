/**
 * Demo data for testing each feature without manual input.
 */

// P1 - Contract Analysis Demo
export const P1_DEMO_CONTRACT = `CONTRAT DE PRESTATION DE SERVICES INFORMATIQUES

Entre les soussignés :

La société TECH SOLUTIONS SAS, au capital de 50 000 euros, immatriculée au RCS de Paris sous le numéro 123 456 789, dont le siège social est situé au 15 rue de la Paix, 75002 Paris, représentée par M. Jean DUPONT en qualité de Président,
Ci-après dénommée "Le Prestataire",

Et :

La société CLIENT CORP SARL, au capital de 10 000 euros, immatriculée au RCS de Lyon sous le numéro 987 654 321, dont le siège social est situé au 25 avenue des Champs, 69001 Lyon, représentée par Mme Marie MARTIN en qualité de Gérante,
Ci-après dénommée "Le Client",

IL A ÉTÉ CONVENU CE QUI SUIT :

Article 1 - Objet
Le Prestataire s'engage à fournir au Client des services de développement logiciel selon les spécifications définies en Annexe A.

Article 2 - Durée
Le présent contrat est conclu pour une durée de 12 mois à compter de sa signature, renouvelable tacitement.

Article 3 - Prix et modalités de paiement
Le prix des prestations est fixé à 5 000 euros HT par mois, payable à 60 jours fin de mois.
En cas de retard de paiement, des pénalités de 3 fois le taux d'intérêt légal seront appliquées.

Article 4 - Propriété intellectuelle
Tous les développements réalisés dans le cadre du présent contrat resteront la propriété exclusive du Prestataire jusqu'au paiement intégral des sommes dues.

Article 5 - Responsabilité
La responsabilité du Prestataire est limitée au montant des sommes effectivement perçues au titre du présent contrat.
Le Prestataire ne pourra en aucun cas être tenu responsable des dommages indirects.

Article 6 - Confidentialité
Les parties s'engagent à maintenir confidentielles toutes les informations échangées dans le cadre du présent contrat pendant une durée de 2 ans après son terme.

Article 7 - Résiliation
Chaque partie peut résilier le contrat avec un préavis de 30 jours. En cas de manquement grave, la résiliation peut être immédiate.

Article 8 - Données personnelles
Le Prestataire s'engage à traiter les données personnelles conformément au RGPD.

Article 9 - Loi applicable et juridiction
Le présent contrat est soumis au droit français. Tout litige sera soumis aux tribunaux de Paris.

Fait à Paris, le 15 janvier 2025
En deux exemplaires originaux.`;

// P2 - Formation Assistant Demo
export const P2_DEMO_DATA = {
  country: "FR",
  questionnaire: {
    activityType: "tech_startup",
    activityDescription: "Développement d'une plateforme SaaS de gestion de documents juridiques avec IA",
    foundersCount: 2,
    plannedCapital: 15000,
    fundraisingPlanned: true,
    employeesPlanned: 5,
    personalAssetProtection: true,
    exitPlanned: true,
  },
};

// P3 - Legal Advisor Demo
export const P3_DEMO_QUESTIONS = [
  "Mon employeur veut me licencier après 3 ans d'ancienneté. Quels sont mes droits ?",
  "Je suis locataire et mon propriétaire veut augmenter le loyer de 20%. Est-ce légal ?",
  "J'ai reçu un colis endommagé d'une boutique en ligne. Comment me faire rembourser ?",
  "Mon voisin fait des travaux très bruyants le dimanche. Que puis-je faire ?",
];

// P4 - Legal Correspondence Demo (minimal info to trigger clarification)
export const P4_DEMO_DATA = {
  sender: {
    name: "Jean Dupont",
    address: "",
    role: "",
  },
  recipient: {
    name: "Garage Auto Plus",
    address: "",
    role: "",
  },
  subject: "Problème avec réparation voiture",
  context: "Ma voiture a été réparée il y a 2 semaines mais le problème persiste. Le garage refuse de reprendre la réparation gratuitement.",
  objective: "Faire réparer correctement ma voiture",
  tone: "formal" as const,
  jurisdiction: "FR",
};

// P5 - Procedural Documents Demo
export const P5_DEMO_DATA = {
  documentType: "assignation",
  courtType: "civil",
  procedureType: "premiere_instance",
  jurisdiction: "FR",
  caseInfo: {
    court: {
      name: "Tribunal Judiciaire de Paris",
      address: "Parvis du Tribunal de Paris, 75017 Paris",
    },
    parties: {
      plaintiff: {
        name: "Société ABC SARL",
        address: "10 rue du Commerce, 75015 Paris",
        role: "Créancier",
      },
      defendant: {
        name: "Société XYZ SAS",
        address: "25 boulevard Haussmann, 75009 Paris",
        role: "Débiteur",
      },
    },
  },
  facts: [
    { date: "2024-01-15", description: "Signature d'un contrat de fourniture de marchandises pour un montant de 25 000€" },
    { date: "2024-03-01", description: "Livraison des marchandises conformément au contrat" },
    { date: "2024-04-01", description: "Échéance de paiement de la facture n°2024-0342" },
    { date: "2024-05-15", description: "Première relance par courrier recommandé" },
    { date: "2024-07-01", description: "Mise en demeure restée sans effet" },
  ],
  claims: ["Paiement de la somme de 25 000€ au titre de la facture impayée", "Intérêts de retard au taux légal majoré", "Dommages et intérêts pour résistance abusive"],
  request: "Rédiger une assignation en paiement devant le Tribunal Judiciaire de Paris pour recouvrer une créance commerciale de 25 000€",
};
