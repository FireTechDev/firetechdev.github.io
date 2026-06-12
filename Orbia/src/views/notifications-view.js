const LEGEND_ITEMS = [
  { kind: "Feu", color: "#b34646" },
  { kind: "AVP", color: "#d88821" },
  { kind: "SAV", color: "#3177cf" },
  { kind: "Autre", color: "#4a8c78" }
];

function incidentKind(incident) {
  const title = `${incident.title || ""} ${incident.city || ""}`.toUpperCase();

  if (title.includes("FEU")) {
    return "Feu";
  }

  if (title.includes("ACCIDENT") || title.includes("AVP")) {
    return "AVP";
  }

  if (title.includes("SECOURS") || title.includes("AIDE") || title.includes("SAP")) {
    return "SAV";
  }

  return "Autre";
}

function elapsedLabel(incident) {
  const timestamp = new Date(incident.startTime).getTime();

  if (!Number.isFinite(timestamp)) {
    return incident.startedAtLabel || "--:--";
  }

  const minutes = Math.max(0, Math.round((Date.now() - timestamp) / 60000));
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours > 0) {
    return `${hours}h${String(remainingMinutes).padStart(2, "0")}`;
  }

  return `${minutes} min`;
}

function renderLegend(incidents) {
  const incidentsByKind = new Map();

  for (const incident of incidents) {
    const kind = incidentKind(incident);

    if (!incidentsByKind.has(kind)) {
      incidentsByKind.set(kind, incident);
    }
  }

  return LEGEND_ITEMS
    .map((item) => {
      const incident = incidentsByKind.get(item.kind);
      return `
        <span>
          <i style="--incident-color:${incident?.color || item.color}"></i>
          ${item.kind}
        </span>
      `;
    })
    .join("");
}

function renderIncidentListItem(incident) {
  const centers = incident.centers?.length ? incident.centers.join(" · ") : "Centre non precise";
  const vehicles = incident.vehicleTypes?.length
    ? incident.vehicleTypes.join(" · ")
    : `${incident.vehicleCount} engin(s)`;

  return `
    <article class="incident-card incident-card--compact">
      <div class="incident-card__topline">
        <span class="incident-dot" style="--incident-color:${incident.color}"></span>
        <strong>${incident.title}</strong>
        <span>${incident.startedAtLabel}</span>
      </div>
      <p>${incident.city}</p>
      <small>${incident.firefighterCount} pompier(s) · ${vehicles} · ${centers}</small>
    </article>
  `;
}

export function renderNotificationsView(state) {
  const interventions = state.interventions;

  if (!interventions) {
    return `
      <section class="screen-block">
        <div class="panel skeleton-panel">
          <p class="eyebrow">Interventions</p>
          <h2>Chargement des interventions en cours...</h2>
        </div>
      </section>
    `;
  }

  const primaryIncident = interventions.incidents[0];

  return `
    <section class="screen-block">
      <div class="interventions-stage">
        <div class="interventions-stage__toolbar">
          <span class="badge badge--warning">${interventions.activeCount} interventions</span>
          <button class="button button--ghost" data-action="refresh">Rafraichir</button>
        </div>

        <div class="map-frame map-frame--immersive">
          <div class="map-root" data-map-root></div>
          <div class="map-overlay map-overlay--legend">
            ${renderLegend(interventions.incidents)}
          </div>
          ${
            primaryIncident
              ? `
                <article class="map-overlay map-overlay--focus">
                  <div>
                    <span class="incident-dot" style="--incident-color:${primaryIncident.color}"></span>
                    <strong>${primaryIncident.title}</strong>
                    <p>${primaryIncident.city}</p>
                  </div>
                  <div>
                    <span>${elapsedLabel(primaryIncident)}</span>
                    <small>${
                      primaryIncident.vehicleTypes?.length
                        ? primaryIncident.vehicleTypes.join(" · ")
                        : `${primaryIncident.vehicleCount} engin(s)`
                    }</small>
                  </div>
                </article>
              `
              : ""
          }
        </div>
      </div>
    </section>

    <section class="screen-block">
      <div class="panel">
        <div class="panel__header panel__header--tight">
          <div>
            <h3>Interventions en cours</h3>
            <p>${interventions.centerActiveCount} touchant le centre · Maj ${interventions.updatedAt}</p>
          </div>
          <span class="badge badge--soft">${interventions.activeCount}</span>
        </div>

        ${
          interventions.incidents.length
            ? `<div class="list-stack">${interventions.incidents.map((incident) => renderIncidentListItem(incident)).join("")}</div>`
            : `<p class="empty-state">Aucune intervention active pour le moment.</p>`
        }
      </div>
    </section>
  `;
}
