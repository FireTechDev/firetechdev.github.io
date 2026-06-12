const wait = (delay = 180) =>
  new Promise((resolve) => {
    window.setTimeout(resolve, delay);
  });

const SESSION_KEY = "orbia-mock-session";
const PLANNING_KEY = "orbia-mock-planning-v2";
const NOW = new Date("2026-06-11T16:52:00+02:00");

const mockSession = {
  displayName: "Tael PINAULT",
  email: "preview@orbia.local",
  avatarUrl: "",
  territory: "SDIS 31",
  focusLabel: "Centre operationnel"
};

const dashboardFixture = {
  profile: mockSession,
  updatedAt: "16:52",
  defaultCenterId: "104",
  centers: [
    {
      id: "104",
      name: "VILLEFRANCHE-LGAIS",
      stationLabel: "VILLEFRANC",
      activeInterventions: 1,
      last24hInterventions: 6
    },
    {
      id: "89",
      name: "REVEL",
      stationLabel: "REVEL",
      activeInterventions: 0,
      last24hInterventions: 3
    },
    {
      id: "75",
      name: "CARAMAN",
      stationLabel: "CARAMAN",
      activeInterventions: 1,
      last24hInterventions: 4
    }
  ],
  views: {
    "104": {
      id: "104",
      name: "VILLEFRANCHE-LGAIS",
      stationLabel: "VILLEFRANC",
      note: "Vue prioritaire du centre au chargement. Les autres centres restent accessibles depuis le select.",
      armabilityPercent: 94,
      summary: {
        availableFirefighters: 7,
        armableVehicles: 6,
        currentInterventions: 1,
        last24hInterventions: 6
      },
      statusChips: [
        { key: "garde", label: "Garde", count: 1 },
        { key: "d1", label: "D1", count: 5 },
        { key: "d2", label: "D2", count: 1 }
      ],
      crewGroups: [
        {
          key: "d1",
          label: "D1",
          count: 5,
          firefighters: [
            {
              id: "vlf-1",
              name: "Damien COSTES",
              grade: "ADJ",
              statusKey: "d1",
              statusGroup: "D1",
              statusLabel: "DISPO 1 CATE",
              detail: "Dernier depart 09/06 15:05",
              shiftStartLabel: "06:00",
              shiftEndLabel: "18:00",
              shiftDurationLabel: "12h",
              skillHighlights: ["CA INC", "CA SR", "COND VL"]
            },
            {
              id: "vlf-2",
              name: "Jean Baptiste TOULOUSE",
              grade: "SGT",
              statusKey: "d1",
              statusGroup: "D1",
              statusLabel: "DISPO 1 CA1E",
              detail: "Dernier depart 06/06 15:06",
              shiftStartLabel: "08:00",
              shiftEndLabel: "20:00",
              shiftDurationLabel: "12h",
              skillHighlights: ["CA SSUAP", "EQ INC", "COND VL"]
            },
            {
              id: "vlf-3",
              name: "Christophe MAUGER",
              grade: "ADJ",
              statusKey: "d1",
              statusGroup: "D1",
              statusLabel: "DISPO 1 CA1E",
              detail: "Aucun depart recent",
              shiftStartLabel: "14:00",
              shiftEndLabel: "02:00",
              shiftDurationLabel: "12h",
              skillHighlights: ["CA INC", "COD1", "COND PL"]
            },
            {
              id: "vlf-4",
              name: "Clement MOMI",
              grade: "SAP1",
              statusKey: "d1",
              statusGroup: "D1",
              statusLabel: "DISPO 1 EQ/CE",
              detail: "Dernier depart 06/06 14:24",
              shiftStartLabel: "06:00",
              shiftEndLabel: "14:00",
              shiftDurationLabel: "8h",
              skillHighlights: ["EQ SSUAP", "EQ INC", "EQ FDFEN"]
            },
            {
              id: "vlf-5",
              name: "Eric LARROQUE",
              grade: "SGT",
              statusKey: "d1",
              statusGroup: "D1",
              statusLabel: "DISPO 1 CA1E",
              detail: "Dernier depart 16/04 10:55",
              shiftStartLabel: "10:00",
              shiftEndLabel: "22:00",
              shiftDurationLabel: "12h",
              skillHighlights: ["CA SSUAP", "EQ INC", "COND VL"]
            }
          ]
        },
        {
          key: "garde",
          label: "Garde",
          count: 1,
          firefighters: [
            {
              id: "vlf-6",
              name: "Nicolas DURAND",
              grade: "CPL",
              statusKey: "garde",
              statusGroup: "Garde",
              statusLabel: "GARDE",
              detail: "Disponible au centre",
              shiftStartLabel: "08:00",
              shiftEndLabel: "16:00",
              shiftDurationLabel: "8h",
              skillHighlights: ["EQ INC", "EQ SSUAP"]
            }
          ]
        },
        {
          key: "d2",
          label: "D2",
          count: 1,
          firefighters: [
            {
              id: "vlf-7",
              name: "Paul MARTIN",
              grade: "SP",
              statusKey: "d2",
              statusGroup: "D2",
              statusLabel: "DISPO 2",
              detail: "Disponible sur rappel",
              shiftStartLabel: "18:00",
              shiftEndLabel: "06:00",
              shiftDurationLabel: "12h",
              skillHighlights: ["EQ INC"]
            }
          ]
        }
      ],
      armabilities: [
        {
          name: "FPTSR",
          status: "Armable",
          description: "Optimal",
          available: true,
          availableRoles: 5,
          totalRoles: 6,
          percent: 83,
          missingRoles: ["Equipier lutte contre l'incendie"],
          roles: [
            { code: "CE INC", label: "Chef d'equipe", available: true },
            { code: "EQ INC", label: "Equipier", available: true },
            { code: "EQ INC", label: "Equipier", available: false },
            { code: "CA INC", label: "Chef d'agres", available: true },
            { code: "COD1", label: "Conducteur", available: true }
          ]
        },
        {
          name: "CCF",
          status: "Armable",
          description: "Complet",
          available: true,
          availableRoles: 3,
          totalRoles: 3,
          percent: 100,
          missingRoles: [],
          roles: []
        },
        {
          name: "VSAV 1",
          status: "Armable",
          description: "Complet",
          available: true,
          availableRoles: 2,
          totalRoles: 2,
          percent: 100,
          missingRoles: [],
          roles: [
            { code: "CA SSUAP", label: "Chef d'agres", available: true },
            { code: "EQ SSUAP", label: "Equipier", available: true }
          ]
        },
        {
          name: "VSAV 2",
          status: "Armable",
          description: "Complet",
          available: true,
          availableRoles: 2,
          totalRoles: 2,
          percent: 100,
          missingRoles: [],
          roles: []
        },
        {
          name: "CCGC",
          status: "Sous-effectif",
          description: "A completer",
          available: false,
          availableRoles: 1,
          totalRoles: 2,
          percent: 50,
          missingRoles: ["Conducteur"],
          roles: []
        },
        {
          name: "VID",
          status: "Armable",
          description: "Complet",
          available: true,
          availableRoles: 2,
          totalRoles: 2,
          percent: 100,
          missingRoles: [],
          roles: []
        },
        {
          name: "VL",
          status: "Armable",
          description: "Complet",
          available: true,
          availableRoles: 1,
          totalRoles: 1,
          percent: 100,
          missingRoles: [],
          roles: []
        }
      ],
      currentOperations: [
        {
          id: "op-vlf",
          title: "Secours a personne",
          city: "Villefranche-de-Lauragais",
          startTime: "2026-06-11T15:41:00+02:00",
          startedAtLabel: "15:41",
          vehicleCount: 1,
          firefighterCount: 3,
          color: "#0d7c71",
          centers: ["VILLEFRANCHE-LGAIS"]
        }
      ]
    },
    "89": {
      id: "89",
      name: "REVEL",
      stationLabel: "REVEL",
      note: "Centre voisin pour comparer rapidement la profondeur de garde.",
      armabilityPercent: 67,
      summary: {
        availableFirefighters: 4,
        armableVehicles: 1,
        currentInterventions: 0,
        last24hInterventions: 3
      },
      statusChips: [
        { key: "garde", label: "Garde", count: 1 },
        { key: "astreinte", label: "Astreinte", count: 2 },
        { key: "d1", label: "D1", count: 1 }
      ],
      crewGroups: [
        {
          key: "garde",
          label: "Garde",
          count: 1,
          firefighters: [
            {
              id: "rev-1",
              name: "Marion BOUDET",
              grade: "CPL",
              statusKey: "garde",
              statusGroup: "Garde",
              statusLabel: "GARDE 12",
              detail: "Disponible au centre",
              skillHighlights: ["EQ SSUAP", "EQ INC"]
            }
          ]
        }
      ],
      armabilities: [
        {
          name: "VSAV",
          status: "Armable",
          description: "Complet",
          available: true,
          availableRoles: 3,
          totalRoles: 3,
          percent: 100,
          missingRoles: [],
          roles: []
        }
      ],
      currentOperations: []
    },
    "75": {
      id: "75",
      name: "CARAMAN",
      stationLabel: "CARAMAN",
      note: "Lecture secondaire utile sur le secteur est.",
      armabilityPercent: 72,
      summary: {
        availableFirefighters: 3,
        armableVehicles: 1,
        currentInterventions: 1,
        last24hInterventions: 4
      },
      statusChips: [
        { key: "astreinte", label: "Astreinte", count: 1 },
        { key: "d1", label: "D1", count: 2 }
      ],
      crewGroups: [
        {
          key: "d1",
          label: "D1",
          count: 2,
          firefighters: [
            {
              id: "car-1",
              name: "Lucas ROUAIX",
              grade: "CPL",
              statusKey: "d1",
              statusGroup: "D1",
              statusLabel: "DISPO 1 EQ/CE",
              detail: "Disponible immediate",
              skillHighlights: ["EQ INC", "EQ SSUAP"]
            },
            {
              id: "car-2",
              name: "Anais FAURE",
              grade: "SAP",
              statusKey: "d1",
              statusGroup: "D1",
              statusLabel: "DISPO 1 EQ/CE",
              detail: "Disponible immediate",
              skillHighlights: ["EQ INC", "EQ FDFEN"]
            }
          ]
        }
      ],
      armabilities: [
        {
          name: "VTU",
          status: "Armable",
          description: "Correct",
          available: true,
          availableRoles: 2,
          totalRoles: 3,
          percent: 67,
          missingRoles: ["Conducteur"],
          roles: []
        }
      ],
      currentOperations: [
        {
          id: "op-car",
          title: "Feu de vegetation",
          city: "Caraman",
          startTime: "2026-06-11T14:58:00+02:00",
          startedAtLabel: "14:58",
          vehicleCount: 1,
          firefighterCount: 4,
          color: "#d97d1b",
          centers: ["CARAMAN"]
        }
      ]
    }
  }
};

const interventionsFixture = {
  updatedAt: "16:52",
  activeCount: 3,
  centerActiveCount: 1,
  incidents: [
    {
      id: "mock-op-1",
      title: "Secours a personne",
      city: "Villefranche-de-Lauragais",
      startTime: "2026-06-11T15:41:00+02:00",
      startedAtLabel: "15:41",
      vehicleCount: 1,
      firefighterCount: 3,
      color: "#0d7c71",
      gps: { lat: 43.4019, lng: 1.7169 },
      centers: ["VILLEFRANCHE-LGAIS"]
    },
    {
      id: "mock-op-2",
      title: "Feu de vegetation",
      city: "Caraman",
      startTime: "2026-06-11T14:58:00+02:00",
      startedAtLabel: "14:58",
      vehicleCount: 1,
      firefighterCount: 4,
      color: "#d97d1b",
      gps: { lat: 43.5308, lng: 1.7554 },
      centers: ["CARAMAN"]
    },
    {
      id: "mock-op-3",
      title: "Fuite de gaz",
      city: "Ayguesvives",
      startTime: "2026-06-11T16:08:00+02:00",
      startedAtLabel: "16:08",
      vehicleCount: 2,
      firefighterCount: 5,
      color: "#b34646",
      gps: { lat: 43.4345, lng: 1.5992 },
      centers: ["MONTGISCARD", "VILLEFRANCHE-LGAIS"]
    }
  ]
};

const planningFixture = {
  updatedAt: "16:52",
  current: {
    short: "ND",
    label: "Non declenchable",
    structureCode: "031-VILLEFRANC",
    availableNow: 5,
    totalPool: 59
  },
  quickOptions: {
    enabled: true,
    hours: [1, 2, 3, 4, 5, 6],
    defaultHours: 4,
    maxDurationDays: 7,
    affectationId: "65a249ec-d08a-4380-b7ec-67522f5fdda3",
    availabilityCode: "DISPONIBLE_8",
    availabilityShort: "D8",
    availabilityLabel: "Disponibilite",
    defaultPositionId: "79d16d45-4a00-48b2-8661-a77a5fa73e0d",
    positions: [
      {
        id: "79d16d45-4a00-48b2-8661-a77a5fa73e0d",
        code: "D1 CATE",
        label: "D1 CATE"
      },
      {
        id: "40b49f22-96da-462a-8109-a074016b7a59",
        code: "D1 EQ/CE",
        label: "D1 EQ/CE"
      },
      {
        id: "2b1a79ab-dca9-4f30-a6c8-a9f4cdc07171",
        code: "D1 EQ",
        label: "D1 EQ"
      },
      {
        id: "mock-d2",
        code: "D2",
        label: "D2"
      },
      {
        id: "mock-d3",
        code: "D3",
        label: "D3"
      }
    ]
  },
  entries: [
    {
      id: "entry-1",
      startTime: "2026-06-12T06:00:00+02:00",
      endTime: "2026-06-12T18:00:00+02:00",
      startLabel: "12/06 06:00",
      endLabel: "12/06 18:00",
      durationHours: 12,
      centerName: "VILLEFRANCHE-LGAIS",
      availabilityShort: "D8",
      availabilityCode: "DISPONIBLE_8",
      positionCode: "D1 CATE",
      positionLabel: "D1 CATE",
      isFuture: true,
      canDelete: true
    },
    {
      id: "entry-2",
      startTime: "2026-06-14T08:00:00+02:00",
      endTime: "2026-06-14T16:00:00+02:00",
      startLabel: "14/06 08:00",
      endLabel: "14/06 16:00",
      durationHours: 8,
      centerName: "VILLEFRANCHE-LGAIS",
      availabilityShort: "D8",
      availabilityCode: "DISPONIBLE_8",
      positionCode: "D1 EQ/CE",
      positionLabel: "D1 EQ/CE",
      isFuture: true,
      canDelete: true
    },
    {
      id: "entry-3",
      startTime: "2026-06-15T00:00:00+02:00",
      endTime: "2026-06-15T08:00:00+02:00",
      startLabel: "15/06 00:00",
      endLabel: "15/06 08:00",
      durationHours: 8,
      centerName: "VILLEFRANCHE-LGAIS",
      availabilityShort: "ND",
      availabilityCode: "INDISPONIBLE",
      positionCode: "INDISPO",
      positionLabel: "Indisponible",
      isFuture: true,
      canDelete: true
    }
  ]
};

function clone(value) {
  return structuredClone(value);
}

function loadPlanningEntries() {
  const raw = window.sessionStorage.getItem(PLANNING_KEY);

  if (!raw) {
    const seeded = clone(planningFixture.entries);
    window.sessionStorage.setItem(PLANNING_KEY, JSON.stringify(seeded));
    return seeded;
  }

  return JSON.parse(raw);
}

function savePlanningEntries(entries) {
  window.sessionStorage.setItem(PLANNING_KEY, JSON.stringify(entries));
}

function formatDateTime(dateLike) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(dateLike));
}

export class MockOrbeGateway {
  async restoreSession() {
    await wait(120);
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  async signIn({ email, password }) {
    await wait(220);

    if (!email || !password) {
      throw new Error("Renseigne ton email et ton mot de passe.");
    }

    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(mockSession));
    return clone(mockSession);
  }

  async signOut() {
    await wait(100);
    window.sessionStorage.removeItem(SESSION_KEY);
  }

  async getDashboard(centerId = dashboardFixture.defaultCenterId) {
    await wait(160);
    const id = String(centerId || dashboardFixture.defaultCenterId);
    const centerView =
      dashboardFixture.views[id] || dashboardFixture.views[dashboardFixture.defaultCenterId];

    return {
      profile: clone(dashboardFixture.profile),
      updatedAt: dashboardFixture.updatedAt,
      defaultCenterId: dashboardFixture.defaultCenterId,
      centers: clone(dashboardFixture.centers),
      center: clone(centerView)
    };
  }

  async getInterventions(centerId = dashboardFixture.defaultCenterId) {
    await wait(160);
    const selectedCenter =
      dashboardFixture.centers.find((item) => item.id === String(centerId)) ||
      dashboardFixture.centers.find((item) => item.id === dashboardFixture.defaultCenterId);

    return {
      ...clone(interventionsFixture),
      centerActiveCount: interventionsFixture.incidents.filter((incident) =>
        incident.centers.includes(selectedCenter.name)
      ).length
    };
  }

  async getPlanning() {
    await wait(150);
    const entries = loadPlanningEntries();

    return {
      ...clone(planningFixture),
      entries: entries.map((entry) => ({
        ...entry,
        startLabel: formatDateTime(entry.startTime),
        endLabel: formatDateTime(entry.endTime)
      }))
    };
  }

  async createQuickShift({ availabilityMode = "available", hours, positionId }) {
    await wait(220);

    const isUnavailable = availabilityMode === "unavailable";
    const positions = planningFixture.quickOptions.positions;
    const position =
      positions.find((item) => item.id === positionId) || positions[0];

    const start = new Date(NOW);
    const end = new Date(start.getTime() + Number(hours || 2) * 3600000);
    const entries = loadPlanningEntries();

    entries.unshift({
      id: crypto.randomUUID(),
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      durationHours: Number(hours || 2),
      centerName: "VILLEFRANCHE-LGAIS",
      availabilityShort: isUnavailable ? "ND" : "D8",
      availabilityCode: isUnavailable ? "INDISPONIBLE_0" : "DISPONIBLE_8",
      positionCode: isUnavailable ? "INDISPO" : position.code,
      positionLabel: isUnavailable ? "Indisponible" : position.label,
      isFuture: true,
      canDelete: true
    });

    savePlanningEntries(entries);
    return this.getPlanning();
  }

  async deletePlanningEntry(entryId) {
    await wait(180);
    const entries = loadPlanningEntries().filter((entry) => entry.id !== entryId);
    savePlanningEntries(entries);
    return null;
  }
}
