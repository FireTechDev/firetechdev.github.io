const FIREFIGHTER_STATUS_CLASS = {
  GARDE: "status-pill--garde",
  ASTREINTE: "status-pill--astreinte",
  D1: "status-pill--d1",
  D2: "status-pill--d2",
  INTER: "status-pill--inter"
};

function initialsFromName(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
}

function formatMetricCards(center) {
  return [
    {
      label: "Pompiers disponibles",
      value: center.summary.availableFirefighters,
      tone: "success",
      detail: "Personnel mobilisable maintenant"
    },
    {
      label: "Engins armables",
      value: center.summary.armableVehicles,
      tone: "calm",
      detail: "Vehicules pouvant partir"
    },
    {
      label: "Interventions actuelles",
      value: center.summary.currentInterventions,
      tone: "warning",
      detail: "Depart(s) en cours sur le secteur"
    },
    {
      label: "Interventions sur 24 h",
      value: center.summary.last24hInterventions,
      tone: "alert",
      detail: "Activite recente du centre"
    }
  ];
}

export function renderDashboardView(state) {
  const dashboard = state.dashboard;

  if (!dashboard) {
    return `
      <section class="screen-block">
        <div class="panel skeleton-panel">
          <p class="eyebrow">Statut operationnel</p>
          <h2>Chargement de la disponibilite du centre...</h2>
        </div>
      </section>
    `;
  }

  const centers = dashboard.centers;
  const selectedCenter =
    centers.find((center) => center.id === state.selectedCenterId) ||
    centers.find((center) => center.id === dashboard.defaultCenterId) ||
    centers[0];
  const metrics = formatMetricCards(selectedCenter);
  const currentOperations = selectedCenter.currentOperations.length
    ? selectedCenter.currentOperations
    : [
        {
          title: "Aucune intervention en cours",
          since: "Centre disponible",
          vehicle: "Veille simple"
        }
      ];

  return `
    <section class="screen-block">
      <div class="hero-card hero-card--ops">
        <div class="hero-card__header">
          <div>
            <p class="eyebrow">${dashboard.profile.territory}</p>
            <h2>${dashboard.profile.focusLabel}</h2>
          </div>
          <button class="button button--ghost" data-action="refresh">
            Rafraichir
          </button>
        </div>

        <div class="ops-toolbar">
          <label class="field field--select">
            <span>Centre de secours</span>
            <select data-field="selected-center" aria-label="Centre de secours">
              ${centers
                .map(
                  (center) => `
                    <option value="${center.id}" ${
                      center.id === selectedCenter.id ? "selected" : ""
                    }>
                      ${center.name}
                    </option>
                  `
                )
                .join("")}
            </select>
          </label>

          <div class="ops-meta">
            <span class="badge badge--strong">${selectedCenter.stationLabel}</span>
            <span class="badge badge--soft">Maj ${selectedCenter.updatedAt}</span>
          </div>
        </div>

        <p class="hero-note">${selectedCenter.note}</p>
      </div>
    </section>

    <section class="screen-block">
      <div class="stats-grid stats-grid--ops">
        ${metrics
          .map(
            (item) => `
              <article class="stat-card stat-card--${item.tone}">
                <span>${item.label}</span>
                <strong>${item.value}</strong>
                <small>${item.detail}</small>
              </article>
            `
          )
          .join("")}
      </div>
    </section>

    <section class="screen-block">
      <div class="panel panel--dense">
        <div class="panel__header">
          <div>
            <p class="eyebrow">Disponibilite detaillee</p>
            <h3>${selectedCenter.summary.availableFirefighters} pompiers mobilisables</h3>
          </div>
          <span class="badge badge--soft">${dashboard.profile.role}</span>
        </div>

        <div class="availability-grid">
          ${selectedCenter.availability
            .map(
              (item) => `
                <article class="availability-chip availability-chip--${item.key}">
                  <span>${item.label}</span>
                  <strong>${item.count}</strong>
                </article>
              `
            )
            .join("")}
        </div>

        <div class="panel__header">
          <div>
            <p class="eyebrow">Interventions actuelles</p>
            <h3>Ce qui engage le centre maintenant</h3>
          </div>
        </div>

        <div class="ops-list">
          ${currentOperations
            .map(
              (operation) => `
                <article class="ops-list__item">
                  <div>
                    <strong>${operation.title}</strong>
                    <p>${operation.since}</p>
                  </div>
                  <span class="badge badge--soft">${operation.vehicle}</span>
                </article>
              `
            )
            .join("")}
        </div>
      </div>
    </section>

    <section class="screen-block">
      <div class="panel">
        <div class="panel__header">
          <div>
            <p class="eyebrow">Qui est disponible</p>
            <h3>Lecture claire du personnel</h3>
          </div>
        </div>

        <div class="crew-list">
          ${selectedCenter.firefighters
            .map(
              (firefighter) => `
                <article class="firefighter-card">
                  <div class="firefighter-card__identity">
                    <span class="initials">${initialsFromName(firefighter.name)}</span>
                    <div>
                      <p class="firefighter-card__rank">${firefighter.rank}</p>
                      <h4>${firefighter.name}</h4>
                      <p>${firefighter.detail}</p>
                    </div>
                  </div>
                  <span class="status-pill ${
                    FIREFIGHTER_STATUS_CLASS[firefighter.status] || "status-pill--d1"
                  }">${firefighter.status}</span>
                </article>
              `
            )
            .join("")}
        </div>
      </div>
    </section>

    <section class="screen-block">
      <div class="panel panel--dense">
        <div class="panel__header">
          <div>
            <p class="eyebrow">Engins</p>
            <h3>Ce qui peut partir proprement</h3>
          </div>
        </div>

        <div class="vehicle-list">
          ${selectedCenter.vehicles
            .map(
              (vehicle) => `
                <article class="vehicle-card">
                  <div>
                    <strong>${vehicle.name}</strong>
                    <p>${vehicle.detail}</p>
                  </div>
                  <span class="status-pill ${
                    vehicle.status === "Armable" ? "status-pill--ready" : "status-pill--watch"
                  }">${vehicle.status}</span>
                </article>
              `
            )
            .join("")}
        </div>
      </div>
    </section>
  `;
}
