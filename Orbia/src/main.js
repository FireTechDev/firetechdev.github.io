import { renderApp } from "./app.js";
import { createOrbeGateway } from "./data/create-orbe-gateway.js";
import { goTo, getRoute } from "./router.js";
import { createStore } from "./store.js";

const root = document.querySelector("#app");
const { gateway, mode } = createOrbeGateway();

const store = createStore({
  mode,
  route: getRoute(),
  session: null,
  dashboard: null,
  notifications: null,
  planning: null,
  online: navigator.onLine,
  installPrompt: null,
  centerSearch: "",
  centerFilter: "all",
  authBusy: false,
  authError: "",
  dataBusy: false,
  loadingMessage: "Chargement..."
});

function setState(patch) {
  store.setState((state) => ({ ...state, ...patch }));
}

function syncRoute() {
  const route = store.getState().session ? getRoute() : "login";
  setState({ route });
}

async function refreshData() {
  const current = store.getState();

  if (!current.session) {
    return;
  }

  setState({
    dataBusy: true,
    loadingMessage: "Synchronisation des ecrans..."
  });

  try {
    const [dashboard, notifications, planning] = await Promise.all([
      gateway.getDashboard(),
      gateway.getNotifications(),
      gateway.getPlanning()
    ]);

    setState({
      dashboard,
      notifications,
      planning,
      dataBusy: false,
      loadingMessage: ""
    });
  } catch (error) {
    setState({
      dataBusy: false,
      loadingMessage: "",
      authError:
        error instanceof Error
          ? error.message
          : "Impossible de synchroniser les donnees Orbe."
    });
  }
}

async function bootstrap() {
  renderApp(root, store.getState());

  try {
    const session = await gateway.restoreSession();

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
          : "La session Orbe n'a pas pu etre restauree."
    });
  }

  goTo("login");
}

store.subscribe((state) => {
  renderApp(root, state);
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

  const filterButton = event.target.closest("[data-status-filter]");

  if (filterButton) {
    setState({ centerFilter: filterButton.dataset.statusFilter || "all" });
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
    await refreshData();
    return;
  }

  if (action === "logout") {
    await gateway.signOut();
    setState({
      session: null,
      dashboard: null,
      notifications: null,
      planning: null,
      authBusy: false,
      authError: "",
      centerSearch: "",
      centerFilter: "all"
    });
    goTo("login");
  }
});

root.addEventListener("input", (event) => {
  const input = event.target.closest("[data-field='center-search']");

  if (!input) {
    return;
  }

  setState({ centerSearch: input.value });
});

root.addEventListener("submit", async (event) => {
  const form = event.target.closest("[data-form='login']");

  if (!form) {
    return;
  }

  event.preventDefault();

  const formData = new FormData(form);
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
          : "Connexion indisponible. Reessayez dans un instant."
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
