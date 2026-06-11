import { renderDashboardView } from "./views/dashboard-view.js";
import { renderLoginView } from "./views/login-view.js";
import { renderNotificationsView } from "./views/notifications-view.js";
import { renderPlanningView } from "./views/planning-view.js";

function icon(name) {
  const paths = {
    centre:
      '<path d="M4 10.5 12 4l8 6.5V20H4v-9.5Z" /><path d="M9.5 20v-5h5v5" />',
    inters:
      '<path d="M7 18h10" /><path d="m8 18 1.6-5.2A3.5 3.5 0 0 1 13 10h.4a3.5 3.5 0 0 1 3.4 2.8L18 18" /><path d="M11.1 10 9.8 6.8A1 1 0 0 1 10.7 5h2.6a1 1 0 0 1 .9 1.4L12.9 10" />',
    dispo:
      '<rect x="4" y="5" width="16" height="15" rx="3" /><path d="M8 3v4M16 3v4M4 10h16M8 14h3M8 17h6" />',
    menu:
      '<path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" />'
  };

  return `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      ${paths[name]}
    </svg>
  `;
}

function initialsFromName(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
}

function renderUserAvatar(session) {
  if (session.avatarUrl) {
    return `
      <img
        class="topbar__avatar"
        src="${session.avatarUrl}"
        alt=""
        loading="lazy"
      />
    `;
  }

  return `<span class="topbar__avatar topbar__avatar--fallback">${initialsFromName(session.displayName)}</span>`;
}

function renderShell(state, view) {
  const { route, session, mode, installPrompt, dataBusy, loadingMessage, authError } = state;

  return `
    <div class="app-shell">
      <header class="topbar">
        <div class="topbar__profile">
          ${renderUserAvatar(session)}
          <h1>${session.displayName}</h1>
        </div>
        <button class="topbar__menu" data-action="open-menu" aria-label="Ouvrir le menu">
          ${icon("menu")}
        </button>
      </header>

      ${
        installPrompt
          ? `
            <section class="screen-block">
              <button class="install-banner" data-action="install">
                <span>Installer Orbia pour un acces mobile plus direct.</span>
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
              <div class="panel panel--dense panel--soft">
                <p class="eyebrow">Synchronisation</p>
                <strong>${loadingMessage}</strong>
              </div>
            </section>
          `
          : ""
      }

      ${
        authError
          ? `
            <section class="screen-block">
              <div class="panel panel--dense">
                <p class="inline-message inline-message--error">${authError}</p>
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
          ${icon("centre")}
          <span>Disponibilite</span>
        </button>
        <button class="tabbar__item ${route === "planning" ? "tabbar__item--active" : ""}" data-route="planning">
          ${icon("dispo")}
          <span>Planning</span>
        </button>
        <button class="tabbar__item ${route === "notifications" ? "tabbar__item--active" : ""}" data-route="notifications">
          ${icon("inters")}
          <span>Interventions</span>
        </button>
      </nav>

      ${
        mode === "proxy"
          ? `
            <button class="floating-logout" data-action="logout" aria-label="Se deconnecter">
              Sortir
            </button>
          `
          : ""
      }
    </div>
  `;
}

export function renderApp(root, state) {
  if (!state.session) {
    const view = renderLoginView(state);
    root.innerHTML = `<div class="app-shell app-shell--login">${view}</div>`;
    return;
  }

  let view = "";

  if (state.route === "notifications") {
    view = renderNotificationsView(state);
  } else if (state.route === "planning") {
    view = renderPlanningView(state);
  } else {
    view = renderDashboardView(state);
  }

  root.innerHTML = renderShell(state, view);
}
