const ROUTES = new Set(["login", "cartes", "notifications", "planning"]);

export function getRoute(hash = window.location.hash) {
  const cleaned = hash.replace(/^#\/?/, "");
  const route = cleaned.split("?")[0] || "cartes";

  if (!ROUTES.has(route)) {
    return "cartes";
  }

  return route;
}

export function goTo(route) {
  const safeRoute = ROUTES.has(route) ? route : "cartes";
  const target = `#/${safeRoute}`;

  if (window.location.hash !== target) {
    window.location.hash = target;
  }
}
