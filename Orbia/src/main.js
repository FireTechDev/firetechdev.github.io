import { renderApp } from "./app.js";
import { createOrbeGateway } from "./data/create-orbe-gateway.js";
import { syncInterventionsMap } from "./map-controller.js";
import { goTo, getRoute } from "./router.js";
import { createStore } from "./store.js";

const root = document.querySelector("#app");
const { gateway, mode, apiBase } = createOrbeGateway();
const previewSession =
  mode === "mock"
    ? {
        displayName: "Tael PINAULT",
        email: "preview@orbia.local",
        territory: "SDIS 31",
        focusLabel: "Centre operationnel"
      }
    : null;
const initialRoute = previewSession && getRoute() === "login" ? "cartes" : getRoute();

const store = createStore({
  mode,
  apiBase,
  route: initialRoute,
  session: previewSession,
  dashboard: null,
  interventions: null,
  planning: null,
  planningDraft: null,
  online: navigator.onLine,
  installPrompt: null,
  selectedCenterId: "104",
  authBusy: false,
  authError: "",
  dataBusy: false,
  loadingMessage: "Chargement...",
  planningBusy: false,
  planningError: "",
  planningMessage: ""
});

function setState(patch) {
  store.setState((state) => ({ ...state, ...patch }));
}

function syncRoute() {
  const route = store.getState().session ? getRoute() : "login";
  setState({ route });
}

function resolveSelectedCenterId(dashboard, preferredCenterId) {
  if (!dashboard?.centers?.length) {
    return preferredCenterId;
  }

  const hasPreferredCenter = dashboard.centers.some((center) => center.id === preferredCenterId);

  if (hasPreferredCenter) {
    return preferredCenterId;
  }

  return dashboard.center?.id || dashboard.defaultCenterId || dashboard.centers[0].id;
}

function createPlanningDraft(planning, currentDraft) {
  if (!planning?.quickOptions) {
    return null;
  }

  const positionIds = new Set(planning.quickOptions.positions.map((position) => position.id));
  const nextHours = planning.quickOptions.hours.includes(Number(currentDraft?.hours))
    ? Number(currentDraft.hours)
    : planning.quickOptions.defaultHours;
  const nextPositionId = positionIds.has(currentDraft?.positionId)
    ? currentDraft.positionId
    : planning.quickOptions.defaultPositionId;

  return {
    hours: nextHours,
    positionId: nextPositionId
  };
}

async function refreshData(message = "Synchronisation des ecrans...") {
  const current = store.getState();

  if (!current.session) {
    return;
  }

  setState({
    dataBusy: true,
    loadingMessage: message,
    authError: ""
  });

  try {
    const [dashboard, interventions, planning] = await Promise.all([
      gateway.getDashboard(current.selectedCenterId),
      gateway.getInterventions(current.selectedCenterId),
      gateway.getPlanning()
    ]);
    const selectedCenterId = resolveSelectedCenterId(dashboard, current.selectedCenterId);

    setState({
      dashboard,
      interventions,
      planning,
      planningDraft: createPlanningDraft(planning, current.planningDraft),
      selectedCenterId,
      dataBusy: false,
      loadingMessage: "",
      planningError: "",
      planningMessage: current.planningMessage
    });
  } catch (error) {
    setState({
      dataBusy: false,
      loadingMessage: "",
      authError:
        error instanceof Error ? error.message : "Impossible de synchroniser les donnees Orbia."
    });
  }
}

async function bootstrap() {
  render();

  try {
    let session = store.getState().session;

    if (!session) {
      session = await gateway.restoreSession();
    }

    if (session) {
      setState({ session, authError: "" });

      if (getRoute() === "login") {
        goTo("cartes");
      } else {
        syncRoute();
      }

      await refreshData();
      return;
    }
  } catch (error) {
    setState({
      authError:
        error instanceof Error
          ? error.message
          : "La session Orbia n'a pas pu etre restauree."
    });
  }

  goTo("login");
}

function render() {
  renderApp(root, store.getState());
  syncInterventionsMap(root, store.getState());
}

store.subscribe(() => {
  render();
});

window.addEventListener("hashchange", syncRoute);
window.addEventListener("online", () => setState({ online: true }));
window.addEventListener("offline", () => setState({ online: false }));

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  setState({ installPrompt: event });
});

window.addEventListener("appinstalled", () => {
  setState({ installPrompt: null });
});

root.addEventListener("click", async (event) => {
  const routeButton = event.target.closest("[data-route]");

  if (routeButton) {
    goTo(routeButton.dataset.route || "cartes");
    return;
  }

  const actionButton = event.target.closest("[data-action]");

  if (!actionButton) {
    return;
  }

  const action = actionButton.dataset.action;

  if (action === "install") {
    const promptEvent = store.getState().installPrompt;

    if (!promptEvent) {
      return;
    }

    await promptEvent.prompt();
    await promptEvent.userChoice;
    setState({ installPrompt: null });
    return;
  }

  if (action === "refresh") {
    await refreshData("Rafraichissement des donnees...");
    return;
  }

  if (action === "logout") {
    await gateway.signOut();
    setState({
      session: null,
      dashboard: null,
      interventions: null,
      planning: null,
      planningDraft: null,
      authBusy: false,
      authError: "",
      planningBusy: false,
      planningError: "",
      planningMessage: "",
      selectedCenterId: "104"
    });
    goTo("login");
    return;
  }

  if (action === "delete-planning-entry") {
    const entryId = actionButton.dataset.entryId;

    if (!entryId) {
      return;
    }

    setState({
      planningBusy: true,
      planningError: "",
      planningMessage: ""
    });

    try {
      await gateway.deletePlanningEntry(entryId);
      const planning = await gateway.getPlanning();
      setState({
        planning,
        planningDraft: createPlanningDraft(planning, store.getState().planningDraft),
        planningBusy: false,
        planningError: "",
        planningMessage: "Creneau supprime."
      });
    } catch (error) {
      setState({
        planningBusy: false,
        planningError:
          error instanceof Error ? error.message : "La deprogrammation a echoue.",
        planningMessage: ""
      });
    }
  }
});

root.addEventListener("change", async (event) => {
  const centerSelect = event.target.closest("[data-field='selected-center']");

  if (centerSelect) {
    setState({
      selectedCenterId: centerSelect.value,
      planningMessage: "",
      planningError: ""
    });
    await refreshData("Chargement du centre selectionne...");
    return;
  }

  const planningPosition = event.target.closest("[data-field='planning-position']");

  if (planningPosition) {
    setState({
      planningDraft: {
        ...(store.getState().planningDraft || {}),
        positionId: planningPosition.value
      }
    });
  }

  const hoursInput = event.target.closest("input[name='hours']");

  if (hoursInput) {
    setState({
      planningDraft: {
        ...(store.getState().planningDraft || {}),
        hours: Number(hoursInput.value)
      }
    });
  }
});

root.addEventListener("submit", async (event) => {
  const loginForm = event.target.closest("[data-form='login']");

  if (loginForm) {
    event.preventDefault();

    const formData = new FormData(loginForm);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");

    setState({
      authBusy: true,
      authError: ""
    });

    try {
      const session = await gateway.signIn({ email, password });
      setState({
        session,
        authBusy: false,
        authError: ""
      });
      goTo("cartes");
      await refreshData();
    } catch (error) {
      setState({
        authBusy: false,
        authError:
          error instanceof Error
            ? error.message
            : "Connexion indisponible. Reessaie dans un instant."
      });
    }

    return;
  }

  const quickShiftForm = event.target.closest("[data-form='quick-shift']");

  if (!quickShiftForm) {
    return;
  }

  event.preventDefault();

  const formData = new FormData(quickShiftForm);
  const hours = Number(formData.get("hours") || store.getState().planningDraft?.hours || 2);
  const positionId = String(
    formData.get("positionId") || store.getState().planningDraft?.positionId || ""
  );

  setState({
    planningBusy: true,
    planningError: "",
    planningMessage: ""
  });

  try {
    const planning = await gateway.createQuickShift({ hours, positionId });
    setState({
      planning,
      planningDraft: createPlanningDraft(planning, { hours, positionId }),
      planningBusy: false,
      planningError: "",
      planningMessage: `Programme sur ${hours} h enregistre.`
    });
  } catch (error) {
    setState({
      planningBusy: false,
      planningError:
        error instanceof Error
          ? error.message
          : "La programmation n'a pas pu etre enregistree.",
      planningMessage: ""
    });
  }
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    const serviceWorkerUrl = new URL("../service-worker.js", import.meta.url);
    navigator.serviceWorker.register(serviceWorkerUrl).catch(() => {});
  });
}

bootstrap();
