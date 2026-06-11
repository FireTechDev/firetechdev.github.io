const wait = (delay = 220) =>
  new Promise((resolve) => {
    window.setTimeout(resolve, delay);
  });

const dashboardFixture = {
  profile: {
    displayName: "Tael PINAULT",
    role: "Coordination terrain",
    territory: "SDIS 31",
    focusLabel: "Statut operationnel"
  },
  summary: [
    { label: "Centres sous tension", value: "03", tone: "alert" },
    { label: "Engins armables", value: "142", tone: "calm" },
    { label: "Competences actives", value: "218", tone: "success" }
  ],
  operationHighlights: [
    {
      label: "Lecture terrain",
      value: "Nord-ouest prioritaire",
      detail: "3 centres a surveiller dans les 45 prochaines minutes"
    },
    {
      label: "Derniere remontee",
      value: "15:42",
      detail: "Mise a jour operationnelle synchronisee"
    }
  ],
  centers: [
    {
      name: "COLOMIERS",
      status: "critical",
      readiness: 62,
      crew: "5 / 8",
      note: "VSAV incomplet sur la prochaine garde"
    },
    {
      name: "TOULOUSE-A",
      status: "warning",
      readiness: 78,
      crew: "7 / 9",
      note: "Renfort utile sur l'armement lourd"
    },
    {
      name: "MURET-MASS",
      status: "good",
      readiness: 96,
      crew: "8 / 8",
      note: "Configuration nominale"
    },
    {
      name: "RAMONVILLE",
      status: "warning",
      readiness: 81,
      crew: "6 / 7",
      note: "Competence specialiste a confirmer"
    },
    {
      name: "SAINT-GAUD",
      status: "good",
      readiness: 91,
      crew: "7 / 7",
      note: "Astreinte stable"
    },
    {
      name: "REVEL",
      status: "critical",
      readiness: 58,
      crew: "4 / 7",
      note: "Double indisponibilite sur le secteur"
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
