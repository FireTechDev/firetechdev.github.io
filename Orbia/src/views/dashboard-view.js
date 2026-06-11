const STATUS_CLASS = {
  garde: "status-pill--garde",
  astreinte: "status-pill--astreinte",
  d1: "status-pill--d1",
  d2: "status-pill--d2",
  d3: "status-pill--d3",
  inter: "status-pill--inter",
  other: "status-pill--watch"
};

function initialsFromName(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
}

function renderGauge(percent) {
  const radius = 72;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (Math.max(0, Math.min(percent, 100)) / 100) * circumference;

  return `
    <div class="armability-gauge" aria-label="Armabilite ${percent}%">
      <svg viewBox="0 0 180 180" role="img" aria-hidden="true">
        <circle cx="90" cy="90" r="${radius}" class="armability-gauge__track"></circle>
        <circle
          cx="90"
          cy="90"
          r="${radius}"
          class="armability-gauge__progress"
          stroke-dasharray="${circumference}"
          stroke-dashoffset="${strokeOffset}"
        ></circle>
      </svg>
      <div class="armability-gauge__value">
        <strong>${percent}</strong>
        <span>%</span>
      </div>
    </div>
  `;
}

function renderSummaryCards(center) {
  return [
    {
      label: "Pompiers disponibles",
      value: center.summary.availableFirefighters,
      tone: "success"
    },
    {
      label: "Engins armables",
      value: center.summary.armableVehicles,
      tone: "calm"
    },
    {
      label: "Interventions actuelles",
      value: center.summary.currentInterventions,
      tone: "warning"
    },
    {
      label: "Interventions 24 h",
      value: center.summary.last24hInterventions,
      tone: "alert"
    }
  ];
}

export function renderDashboardView(state) {
  const dashboard = state.dashboard;

  if (!dashboard) {
    return `
      <section class="screen-block">
        <div class="panel skeleton-panel">
          <p class="eyebrow">Centre</p>
          <h2>Chargement de la liste de garde...</h2>
        </div>
      </section>
    `;
  }

  const center = dashboard.center;
  const cards = renderSummaryCards(center);
  const firstArmability = center.armabilities[0];

  return `
    <section class="screen-block">
      <div class="hero-ops">
        <div class="hero-ops__header">
          <div>
            <p class="eyebrow eyebrow--light">Liste de garde</p>
            <h2>${center.name}</h2>
          </div>
          <button class="button button--ghost button--light" data-action="refresh">
            Rafraichir
          </button>
        </div>

        <label class="field field--select field--invert">
          <span>Centre de secours</span>
          <select data-field="selected-center" aria-label="Centre de secours">
            ${dashboard.centers
              .map(
                (item) => `
                  <option value="${item.id}" ${item.id === center.id ? "selected" : ""}>
                    ${item.name}
                  </option>
                `
              )
              .join("")}
          </select>
        </label>

        <p class="hero-ops__note">${center.note}</p>
      </div>
    </section>

    <section class="screen-block">
      <div class="panel panel--gauge">
        ${renderGauge(center.armabilityPercent)}
        <div class="panel__content">
          <p class="section-label">Armabilite</p>
          <h3>${center.summary.armableVehicles} engin(s) pret(s) a partir</h3>
          <p>
            ${
              firstArmability
                ? `${firstArmability.name} est ${firstArmability.status.toLowerCase()} avec ${firstArmability.availableRoles}/${firstArmability.totalRoles} postes couverts.`
                : "Aucun detail d'armabilite n'a ete remonte par Orbe."
            }
          </p>
        </div>
      </div>
    </section>

    <section class="screen-block">
      <div class="stats-grid stats-grid--ops">
        ${cards
          .map(
            (card) => `
              <article class="stat-card stat-card--${card.tone}">
                <span>${card.label}</span>
                <strong>${card.value}</strong>
              </article>
            `
          )
          .join("")}
      </div>
    </section>

    <section class="screen-block">
      <div class="panel">
        <div class="panel__header">
          <div>
            <p class="section-label">Etat dispo.</p>
            <h3>Qui est mobilisable maintenant</h3>
          </div>
          <span class="badge badge--soft">Maj ${dashboard.updatedAt}</span>
        </div>

        <div class="status-chip-grid">
          ${center.statusChips
            .map(
              (chip) => `
                <article class="availability-chip availability-chip--${chip.key}">
                  <span>${chip.label}</span>
                  <strong>${chip.count}</strong>
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
            <p class="section-label">En interventions</p>
            <h3>${center.currentOperations.length} depart(s) en cours</h3>
          </div>
        </div>

        ${
          center.currentOperations.length
            ? `
              <div class="ops-list">
                ${center.currentOperations
                  .map(
                    (operation) => `
                      <article class="ops-list__item">
                        <div>
                          <strong>${operation.title}</strong>
                          <p>${operation.city} · depuis ${operation.startedAtLabel}</p>
                        </div>
                        <span class="badge badge--soft">${operation.vehicleCount} engin(s)</span>
                      </article>
                    `
                  )
                  .join("")}
              </div>
            `
            : `<p class="empty-state">Aucune intervention ne mobilise actuellement ce centre.</p>`
        }
      </div>
    </section>

    ${center.crewGroups
      .map(
        (group) => `
          <section class="screen-block">
            <div class="panel panel--crew">
              <div class="panel__header">
                <div>
                  <p class="section-label">${group.label}</p>
                  <h3>${group.count} pompier(s)</h3>
                </div>
              </div>

              <div class="crew-list">
                ${group.firefighters
                  .map(
                    (firefighter) => `
                      <article class="firefighter-card">
                        <div class="firefighter-card__identity">
                          <span class="initials">${initialsFromName(firefighter.name)}</span>
                          <div>
                            <p class="firefighter-card__rank">${firefighter.grade}</p>
                            <h4>${firefighter.name}</h4>
                            <p>${firefighter.detail}</p>
                            ${
                              firefighter.skillHighlights.length
                                ? `<small>${firefighter.skillHighlights.join(" · ")}</small>`
                                : ""
                            }
                          </div>
                        </div>
                        <span class="status-pill ${
                          STATUS_CLASS[firefighter.statusKey] || STATUS_CLASS.other
                        }">${firefighter.statusLabel}</span>
                      </article>
                    `
                  )
                  .join("")}
              </div>
            </div>
          </section>
        `
      )
      .join("")}

    <section class="screen-block">
      <div class="panel">
        <div class="panel__header">
          <div>
            <p class="section-label">Armabilite detail</p>
            <h3>Lecture engin par engin</h3>
          </div>
        </div>

        <div class="vehicle-list">
          ${center.armabilities
            .map(
              (armability) => `
                <article class="vehicle-card">
                  <div>
                    <strong>${armability.name}</strong>
                    <p>${armability.description} · ${armability.availableRoles}/${armability.totalRoles} postes couverts</p>
                    ${
                      armability.missingRoles.length
                        ? `<small>Manque: ${armability.missingRoles.join(", ")}</small>`
                        : `<small>Aucun manque detecte</small>`
                    }
                  </div>
                  <span class="status-pill ${
                    armability.available ? "status-pill--ready" : "status-pill--watch"
                  }">${armability.status}</span>
                </article>
              `
            )
            .join("")}
        </div>
      </div>
    </section>
  `;
}
