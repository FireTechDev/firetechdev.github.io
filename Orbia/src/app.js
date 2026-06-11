import { renderDashboardView } from "./views/dashboard-view.js";
import { renderLoginView } from "./views/login-view.js";
import { renderNotificationsView } from "./views/notifications-view.js";
import { renderPlanningView } from "./views/planning-view.js";

function icon(name) {
  const paths = {
    cartes:
      '<path d="M3 6.5L12 3l9 3.5v11L12 21 3 17.5v-11Z" /><path d="M12 3v18" /><path d="M3 6.5l9 3.5 9-3.5" />',
    notifications:
      '<path d="M12 3a4 4 0 0 1 4 4v2.5c0 .7.2 1.4.6 2l1.2 1.8c.5.8 0 1.7-.9 1.7H7.1c-.9 0-1.4-.9-.9-1.7l1.2-1.8c.4-.6.6-1.3.6-2V7a4 4 0 0 1 4-4Z" /><path d="M10 18a2 2 0 0 0 4 0" />',
    planning:
      '<rect x="4" y="5" width="16" height="15" rx="3" /><path d="M8 3v4M16 3v4M4 10h16M8 14h3M8 17h6" />'
  };

  return `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      ${paths[name]}
    </svg>
  `;
}

function renderShell(state, view) {
  const { route, session, mode, online, installPrompt, dataBusy, loadingMessage } = state;

  return `
    <div class="app-shell">
      <div class="ambient ambient--one"></div>
      <div class="ambient ambient--two"></div>

      <header class="topbar">
        <div>
          <p class="eyebrow">Bonjour</p>
          <h1>${session.displayName}</h1>
        </div>
        <div class="topbar__actions">
          <span class="badge ${online ? "badge--soft" : "badge--warning"}">
            ${online ? "En ligne" : "Hors ligne"}
          </span>
          <span class="badge badge--soft">Source ${mode}</span>
        </div>
      </header>

      ${
        installPrompt
          ? `
            <section class="screen-block">
              <button class="install-banner" data-action="install">
                <span>
                  Installer Orbia sur le mobile pour un acces plein ecran plus rapide.
                </span>
                <strong>Installer</strong>
              </button>
            </section>
          `
          : ""
      }

      ${
        dataBusy
          ? `
            <section class="screen-block">
              <div class="panel panel--dense">
                <p class="eyebrow">Synchronisation</p>
                <strong>${loadingMessage}</strong>
              </div>
            </section>
          `
          : ""
      }

      <main class="screen-flow">
        ${view}
      </main>

      <nav class="tabbar" aria-label="Navigation principale">
        <button class="tabbar__item ${route === "cartes" ? "tabbar__item--active" : ""}" data-route="cartes">
          ${icon("cartes")}
          <span>Cartes</span>
        </button>
        <button class="tabbar__item ${route === "notifications" ? "tabbar__item--active" : ""}" data-route="notifications">
          ${icon("notifications")}
          <span>Notifications</span>
        </button>
        <button class="tabbar__item ${route === "planning" ? "tabbar__item--active" : ""}" data-route="planning">
          ${icon("planning")}
          <span>Planning</span>
        </button>
      </nav>

      <button class="floating-logout" data-action="logout" aria-label="Se deconnecter">
        Sortir
      </button>
    </div>
  `;
}

export function renderApp(root, state) {
  let view = "";

  if (!state.session) {
    view = renderLoginView(state);
    root.innerHTML = `<div class="app-shell app-shell--login">${view}</div>`;
    return;
  }

  if (state.route === "notifications") {
    view = renderNotificationsView(state);
  } else if (state.route === "planning") {
    view = renderPlanningView(state);
  } else {
    view = renderDashboardView(state);
  }

  root.innerHTML = renderShell(state, view);
}
