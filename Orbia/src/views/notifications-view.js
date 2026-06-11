export function renderNotificationsView(state) {
  const interventions = state.interventions;

  if (!interventions) {
    return `
      <section class="screen-block">
        <div class="panel skeleton-panel">
          <p class="eyebrow">Inters</p>
          <h2>Chargement des interventions en cours...</h2>
        </div>
      </section>
    `;
  }

  return `
    <section class="screen-block">
      <div class="hero-ops hero-ops--compact">
        <div class="hero-ops__header">
          <div>
            <p class="eyebrow eyebrow--light">Interventions</p>
            <h2>Carte des interventions en cours</h2>
          </div>
          <button class="button button--ghost button--light" data-action="refresh">
            Rafraichir
          </button>
        </div>
        <p class="hero-ops__note">
          Vue globale des interventions actives, avec focus automatique sur le centre selectionne.
        </p>
      </div>
    </section>

    <section class="screen-block">
      <div class="stats-grid stats-grid--ops">
        <article class="stat-card stat-card--warning">
          <span>Interventions actives</span>
          <strong>${interventions.activeCount}</strong>
        </article>
        <article class="stat-card stat-card--calm">
          <span>Touchant le centre</span>
          <strong>${interventions.centerActiveCount}</strong>
        </article>
      </div>
    </section>

    <section class="screen-block">
      <div class="panel panel--map">
        <div class="panel__header">
          <div>
            <p class="section-label">Carte</p>
            <h3>Position des interventions geolocalisees</h3>
          </div>
          <span class="badge badge--soft">Maj ${interventions.updatedAt}</span>
        </div>
        <div class="map-frame">
          <div class="map-root" data-map-root></div>
        </div>
      </div>
    </section>

    <section class="screen-block">
      <div class="panel">
        <div class="panel__header">
          <div>
            <p class="section-label">Flux actif</p>
            <h3>Lecture mobile des interventions</h3>
          </div>
        </div>

        <div class="list-stack">
          ${interventions.incidents
            .map(
              (incident) => `
                <article class="incident-card">
                  <div class="incident-card__topline">
                    <span class="incident-dot" style="--incident-color:${incident.color}"></span>
                    <span>${incident.city}</span>
                    <span>${incident.startedAtLabel}</span>
                  </div>
                  <h4>${incident.title}</h4>
                  <p>${incident.firefighterCount} pompier(s) · ${incident.vehicleCount} engin(s)</p>
                  <small>${incident.centers.join(" · ")}</small>
                </article>
              `
            )
            .join("")}
        </div>
      </div>
    </section>
  `;
}
