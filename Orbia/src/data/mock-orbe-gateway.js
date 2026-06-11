const wait = (delay = 220) =>
  new Promise((resolve) => {
    window.setTimeout(resolve, delay);
  });

const dashboardFixture = {
  defaultCenterId: "villefranche-de-lauragais",
  profile: {
    displayName: "Tael PINAULT",
    role: "Coordination terrain",
    territory: "SDIS 31",
    focusLabel: "Statut operationnel"
  },
  centers: [
    {
      id: "villefranche-de-lauragais",
      name: "Villefranche-de-Lauragais",
      stationLabel: "VILLEFRANCHE-LGAIS",
      updatedAt: "16:14",
      note:
        "Vue prioritaire du centre. Les autres centres restent disponibles dans le menu pour comparaison.",
      summary: {
        availableFirefighters: 5,
        armableVehicles: 2,
        currentInterventions: 1,
        last24hInterventions: 6
      },
      availability: [
        { key: "garde", label: "Garde", count: 0 },
        { key: "astreinte", label: "Astreinte", count: 0 },
        { key: "d1", label: "D1", count: 5 },
        { key: "d2", label: "D2", count: 0 },
        { key: "inter", label: "Inter", count: 0 }
      ],
      currentOperations: [
        {
          title: "Assistance a personne",
          since: "Depuis 14:18",
          vehicle: "VSAV 1"
        }
      ],
      firefighters: [
        {
          id: "vlf-1",
          name: "Damien COSTES",
          rank: "Adjudant",
          status: "D1",
          detail: "Chef d'agres VSAV disponible"
        },
        {
          id: "vlf-2",
          name: "Jean-Baptiste TOULOUSE",
          rank: "Sergent",
          status: "D1",
          detail: "Disponible immediate sur depart SAP"
        },
        {
          id: "vlf-3",
          name: "Christophe MAUGER",
          rank: "Adjudant",
          status: "D1",
          detail: "Renfort conducteur engageable"
        },
        {
          id: "vlf-4",
          name: "Clement MOMI",
          rank: "Sapeur de 1re classe",
          status: "D1",
          detail: "Equipier pret a partir"
        },
        {
          id: "vlf-5",
          name: "Eric LARROQUE",
          rank: "Sergent",
          status: "D1",
          detail: "Disponible jusqu'a la releve du soir"
        }
      ],
      vehicles: [
        {
          id: "veh-vlf-1",
          name: "VSAV 1",
          status: "Armable",
          detail: "Binome complet disponible"
        },
        {
          id: "veh-vlf-2",
          name: "FPT",
          status: "Armable",
          detail: "Chef d'agres et conducteur identifies"
        },
        {
          id: "veh-vlf-3",
          name: "VTU",
          status: "A consolider",
          detail: "Un equipier supplementaire utile"
        }
      ]
    },
    {
      id: "revel",
      name: "Revel",
      stationLabel: "REVEL",
      updatedAt: "16:11",
      note: "Centre voisin pour comparer rapidement la profondeur de garde.",
      summary: {
        availableFirefighters: 4,
        armableVehicles: 1,
        currentInterventions: 0,
        last24hInterventions: 3
      },
      availability: [
        { key: "garde", label: "Garde", count: 1 },
        { key: "astreinte", label: "Astreinte", count: 2 },
        { key: "d1", label: "D1", count: 1 },
        { key: "d2", label: "D2", count: 0 },
        { key: "inter", label: "Inter", count: 0 }
      ],
      currentOperations: [],
      firefighters: [
        {
          id: "rev-1",
          name: "Marion BOUDET",
          rank: "Caporale",
          status: "Garde",
          detail: "Disponible au centre"
        },
        {
          id: "rev-2",
          name: "Julien PECH",
          rank: "Sergent",
          status: "Astreinte",
          detail: "Reponse courte sur declenchement"
        },
        {
          id: "rev-3",
          name: "Cedric BRUN",
          rank: "Caporal-chef",
          status: "Astreinte",
          detail: "Conducteur confirme"
        },
        {
          id: "rev-4",
          name: "Noemie LOPEZ",
          rank: "Sapeur",
          status: "D1",
          detail: "Disponible immediate"
        }
      ],
      vehicles: [
        {
          id: "veh-rev-1",
          name: "VSAV",
          status: "Armable",
          detail: "Depart possible sans renfort"
        },
        {
          id: "veh-rev-2",
          name: "CCF",
          status: "A consolider",
          detail: "Besoin d'un second equipier"
        }
      ]
    },
    {
      id: "caraman",
      name: "Caraman",
      stationLabel: "CARAMAN",
      updatedAt: "16:09",
      note: "Reference secondaire utile en couverture est du secteur.",
      summary: {
        availableFirefighters: 3,
        armableVehicles: 1,
        currentInterventions: 0,
        last24hInterventions: 2
      },
      availability: [
        { key: "garde", label: "Garde", count: 0 },
        { key: "astreinte", label: "Astreinte", count: 1 },
        { key: "d1", label: "D1", count: 2 },
        { key: "d2", label: "D2", count: 0 },
        { key: "inter", label: "Inter", count: 0 }
      ],
      currentOperations: [],
      firefighters: [
        {
          id: "car-1",
          name: "Lucas ROUAIX",
          rank: "Caporal",
          status: "D1",
          detail: "Disponible immediate"
        },
        {
          id: "car-2",
          name: "Anais FAURE",
          rank: "Sapeure",
          status: "D1",
          detail: "Equipiere SAP"
        },
        {
          id: "car-3",
          name: "Fabien DOUAT",
          rank: "Sergent",
          status: "Astreinte",
          detail: "Retour au centre en moins de 10 min"
        }
      ],
      vehicles: [
        {
          id: "veh-car-1",
          name: "VSAV",
          status: "Armable",
          detail: "Equipage minimum confirme"
        }
      ]
    },
    {
      id: "ramonville",
      name: "Ramonville",
      stationLabel: "RAMONVILLE",
      updatedAt: "16:07",
      note: "Centre dense, utile pour suivre l'equilibre est de l'agglomeration.",
      summary: {
        availableFirefighters: 6,
        armableVehicles: 2,
        currentInterventions: 1,
        last24hInterventions: 7
      },
      availability: [
        { key: "garde", label: "Garde", count: 2 },
        { key: "astreinte", label: "Astreinte", count: 2 },
        { key: "d1", label: "D1", count: 1 },
        { key: "d2", label: "D2", count: 0 },
        { key: "inter", label: "Inter", count: 1 }
      ],
      currentOperations: [
        {
          title: "Feu de vegetation",
          since: "Depuis 15:02",
          vehicle: "CCF"
        }
      ],
      firefighters: [
        {
          id: "ram-1",
          name: "Hugo PLANEL",
          rank: "Caporal",
          status: "Garde",
          detail: "Disponible au centre"
        },
        {
          id: "ram-2",
          name: "Melanie RIVALS",
          rank: "Adjudante",
          status: "Garde",
          detail: "Chef d'agres disponible"
        },
        {
          id: "ram-3",
          name: "Nicolas FERRAN",
          rank: "Sergent",
          status: "Astreinte",
          detail: "Depart possible sous 8 min"
        },
        {
          id: "ram-4",
          name: "Romain PAGES",
          rank: "Sapeur",
          status: "Astreinte",
          detail: "Renfort conducteur"
        },
        {
          id: "ram-5",
          name: "Sarah CALMET",
          rank: "Caporale",
          status: "D1",
          detail: "Disponible immediate"
        },
        {
          id: "ram-6",
          name: "Lina VIGUIE",
          rank: "Sapeure",
          status: "Inter",
          detail: "Deja engagee sur intervention"
        }
      ],
      vehicles: [
        {
          id: "veh-ram-1",
          name: "VSAV",
          status: "Armable",
          detail: "Depart SAP sans delai"
        },
        {
          id: "veh-ram-2",
          name: "CCF",
          status: "Armable",
          detail: "Feu de vegetation actuellement engage"
        }
      ]
    },
    {
      id: "muret-mass",
      name: "Muret-Massat",
      stationLabel: "MURET-MASS",
      updatedAt: "16:05",
      note: "Point de comparaison pour un centre bien arme sur la periode.",
      summary: {
        availableFirefighters: 8,
        armableVehicles: 3,
        currentInterventions: 2,
        last24hInterventions: 10
      },
      availability: [
        { key: "garde", label: "Garde", count: 2 },
        { key: "astreinte", label: "Astreinte", count: 3 },
        { key: "d1", label: "D1", count: 2 },
        { key: "d2", label: "D2", count: 0 },
        { key: "inter", label: "Inter", count: 1 }
      ],
      currentOperations: [
        {
          title: "Accident routier",
          since: "Depuis 15:34",
          vehicle: "VSAV 2"
        },
        {
          title: "Reconnaissance fumee",
          since: "Depuis 13:52",
          vehicle: "FPT"
        }
      ],
      firefighters: [
        {
          id: "mur-1",
          name: "Thomas SEGURA",
          rank: "Adjudant",
          status: "Garde",
          detail: "Chef d'agres incendie"
        },
        {
          id: "mur-2",
          name: "Eva MILHAU",
          rank: "Caporale",
          status: "Garde",
          detail: "Disponible au centre"
        },
        {
          id: "mur-3",
          name: "Louis MARTY",
          rank: "Sergent",
          status: "Astreinte",
          detail: "Conducteur conforte"
        },
        {
          id: "mur-4",
          name: "Helene FERAL",
          rank: "Caporale-cheffe",
          status: "Astreinte",
          detail: "Disponible SAP"
        },
        {
          id: "mur-5",
          name: "Mehdi HADDAD",
          rank: "Sapeur",
          status: "Astreinte",
          detail: "Reponse rapide"
        },
        {
          id: "mur-6",
          name: "Leo GINESTET",
          rank: "Caporal",
          status: "D1",
          detail: "Disponible immediate"
        },
        {
          id: "mur-7",
          name: "Claire BERTRAND",
          rank: "Sapeure",
          status: "D1",
          detail: "Equipiere polyvalente"
        },
        {
          id: "mur-8",
          name: "Nora DANIEL",
          rank: "Sapeure",
          status: "Inter",
          detail: "Engagee sur reconnaissance"
        }
      ],
      vehicles: [
        {
          id: "veh-mur-1",
          name: "VSAV 2",
          status: "Armable",
          detail: "Equipage maintenu malgre un depart"
        },
        {
          id: "veh-mur-2",
          name: "FPT",
          status: "Armable",
          detail: "Depart incendie encore possible"
        },
        {
          id: "veh-mur-3",
          name: "VL",
          status: "Armable",
          detail: "Chef de groupe disponible"
        }
      ]
    },
    {
      id: "colomiers",
      name: "Colomiers",
      stationLabel: "COLOMIERS",
      updatedAt: "16:03",
      note: "Point d'appui secondaire pour l'ouest toulousain.",
      summary: {
        availableFirefighters: 7,
        armableVehicles: 2,
        currentInterventions: 1,
        last24hInterventions: 11
      },
      availability: [
        { key: "garde", label: "Garde", count: 3 },
        { key: "astreinte", label: "Astreinte", count: 1 },
        { key: "d1", label: "D1", count: 2 },
        { key: "d2", label: "D2", count: 0 },
        { key: "inter", label: "Inter", count: 1 }
      ],
      currentOperations: [
        {
          title: "Secours a victime",
          since: "Depuis 15:47",
          vehicle: "VSAV"
        }
      ],
      firefighters: [
        {
          id: "col-1",
          name: "Camille ALAUX",
          rank: "Adjudante",
          status: "Garde",
          detail: "Chef d'agres disponible"
        },
        {
          id: "col-2",
          name: "Samuel NIEL",
          rank: "Caporal",
          status: "Garde",
          detail: "Disponible au centre"
        },
        {
          id: "col-3",
          name: "Julie AMAT",
          rank: "Sapeure",
          status: "Garde",
          detail: "Equipiere SAP"
        },
        {
          id: "col-4",
          name: "Alexis BARAT",
          rank: "Sergent",
          status: "Astreinte",
          detail: "Renfort incendie"
        },
        {
          id: "col-5",
          name: "Ludovic PASSERON",
          rank: "Caporal-chef",
          status: "D1",
          detail: "Disponible immediate"
        },
        {
          id: "col-6",
          name: "Marie LAGARD",
          rank: "Sapeure",
          status: "D1",
          detail: "Disponible immediate"
        },
        {
          id: "col-7",
          name: "Antoine REGIS",
          rank: "Sapeur",
          status: "Inter",
          detail: "Deja engage sur SAP"
        }
      ],
      vehicles: [
        {
          id: "veh-col-1",
          name: "VSAV",
          status: "Armable",
          detail: "Rotation equipe en cours"
        },
        {
          id: "veh-col-2",
          name: "FPT",
          status: "Armable",
          detail: "Chef d'agres et conducteur disponibles"
        }
      ]
    }
  ]
};

const notificationsFixture = {
  counters: [
    { label: "Prioritaires", value: 3 },
    { label: "En attente", value: 7 },
    { label: "Cloturees aujourd'hui", value: 14 }
  ],
  items: [
    {
      id: "notif-1",
      level: "critical",
      title: "COLOMIERS - VSAV incomplet",
      category: "Alerte operationnelle",
      time: "Il y a 3 min",
      body: "Un equipier manque sur le prochain depart. Validation du renfort attendue."
    },
    {
      id: "notif-2",
      level: "warning",
      title: "TOULOUSE-A - Competence lots confirmee",
      category: "Confirmation",
      time: "Il y a 12 min",
      body: "Le tableau des competences a ete mis a jour suite a la releve de quart."
    },
    {
      id: "notif-3",
      level: "info",
      title: "Secteur sud - Synoptique rafraichi",
      category: "Information",
      time: "Il y a 19 min",
      body: "Les donnees de disponibilite ont ete synchronisees avec les derniers retours centres."
    },
    {
      id: "notif-4",
      level: "warning",
      title: "REVEL - Armement a confirmer",
      category: "Suivi",
      time: "Il y a 31 min",
      body: "Une verification terrain est attendue avant cloture de la notification."
    }
  ]
};

const planningFixture = {
  nextShift: {
    title: "Prochaine releve",
    date: "Vendredi 12 juin",
    time: "07:00 - 19:00",
    team: "Equipe Nord",
    detail: "Point de bascule sur les centres sensibles a 06:45"
  },
  segments: [
    { label: "Aujourd'hui", value: "2 prises de garde" },
    { label: "Cette semaine", value: "6 presences prevues" },
    { label: "Remplacements", value: "1 a arbitrer" }
  ],
  roster: [
    {
      id: "plan-1",
      when: "Aujourd'hui - 18:30",
      title: "Verification des armements critiques",
      place: "COLOMIERS / TOULOUSE-A",
      status: "important"
    },
    {
      id: "plan-2",
      when: "Demain - 06:45",
      title: "Brief releve de garde",
      place: "MURET-MASS",
      status: "standard"
    },
    {
      id: "plan-3",
      when: "Samedi - 09:15",
      title: "Controle competences specialistes",
      place: "RAMONVILLE",
      status: "standard"
    }
  ]
};

export class MockOrbeGateway {
  constructor() {
    this.sessionKey = "orbia-mock-session";
  }

  async restoreSession() {
    await wait(140);

    const raw = window.sessionStorage.getItem(this.sessionKey);
    return raw ? JSON.parse(raw) : null;
  }

  async signIn({ email, password }) {
    await wait(260);

    if (!email || !password) {
      throw new Error("Renseignez votre email et votre mot de passe.");
    }

    const session = {
      displayName: "Tael PINAULT",
      email,
      territory: "SDIS 31"
    };

    window.sessionStorage.setItem(this.sessionKey, JSON.stringify(session));
    return session;
  }

  async signOut() {
    await wait(120);
    window.sessionStorage.removeItem(this.sessionKey);
  }

  async getDashboard() {
    await wait(180);
    return structuredClone(dashboardFixture);
  }

  async getNotifications() {
    await wait(160);
    return structuredClone(notificationsFixture);
  }

  async getPlanning() {
    await wait(160);
    return structuredClone(planningFixture);
  }
}
