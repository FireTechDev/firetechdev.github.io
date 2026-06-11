function toneLabel(status) {
  if (status === "critical") {
    return "Alerte";
  }

  if (status === "warning") {
    return "Sous tension";
  }

  return "Stable";
}

export function renderDashboardView(state) {
  const dashboard = state.dashboard;

  if (!dashboard) {
    return `
      <section class="screen-block">
        <div class="panel skeleton-panel">
          <p class="eyebrow">Cartes / Synoptiques</p>
          <h2>Chargement de la lecture terrain...</h2>
        </div>
      </section>
    `;
  }

  const query = state.centerSearch.trim().toLowerCase();
  const filter = state.centerFilter;
  const centers = dashboard.centers.filter((center) => {
    const matchesName =
      !query ||
      center.name.toLowerCase().includes(query) ||
      center.note.toLowerCase().includes(query);

    if (!matchesName) {
      return false;
    }

    if (filter === "all") {
      return true;
    }

    return center.status === filter;
  });

  return `
    <section class="screen-block">
      <div class="hero-card">
        <div class="hero-card__header">
          <div>
            <p class="eyebrow">${dashboard.profile.territory}</p>
            <h2>${dashboard.profile.focusLabel}</h2>
          </div>
          <span class="badge badge--strong">${dashboard.profile.role}</span>
        </div>

        <div class="stats-grid">
          ${dashboard.summary
            .map(
              (item) => `
                <article class="stat-card stat-card--${item.tone}">
                  <span>${item.label}</span>
                  <strong>${item.value}</strong>
                </article>
              `
            )
            .join("")}
        </div>
      </div>
    </section>

    <section class="screen-block">
      <div class="panel panel--dense">
        <div class="panel__header panel__header--row">
          <div>
            <p class="eyebrow">Lecture rapide</p>
            <h3>Ce qu'il faut voir maintenant</h3>
          </div>
          <button class="button button--ghost" data-action="refresh">
            Rafraichir
          </button>
        </div>
        <div class="insight-list">
          ${dashboard.operationHighlights
            .map(
              (item) => `
                <article class="insight-item">
                  <span>${item.label}</span>
                  <strong>${item.value}</strong>
                  <p>${item.detail}</p>
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
          <p class="eyebrow">Centres</p>
          <h3>Vue mobile priorisee</h3>
        </div>

        <label class="search-field">
          <span>Recherche</span>
          <input
            data-field="center-search"
            type="search"
            placeholder="Nom d'un centre ou mot cle"
            value="${state.centerSearch}"
          />
        </label>

        <div class="filter-row" role="tablist" aria-label="Filtres centres">
          <button class="pill ${filter === "all" ? "pill--active" : ""}" data-status-filter="all">
            Tous
          </button>
          <button class="pill ${filter === "critical" ? "pill--active" : ""}" data-status-filter="critical">
            Alertes
          </button>
          <button class="pill ${filter === "warning" ? "pill--active" : ""}" data-status-filter="warning">
            Sous tension
          </button>
          <button class="pill ${filter === "good" ? "pill--active" : ""}" data-status-filter="good">
            Stables
          </button>
        </div>

        <div class="list-stack">
          ${
            centers.length
              ? centers
                  .map(
                    (center) => `
                      <article class="center-card center-card--${center.status}">
                        <div class="center-card__title">
                          <div>
                            <h4>${center.name}</h4>
                            <p>${center.note}</p>
                          </div>
                          <span class="badge badge--status badge--${center.status}">
                            ${toneLabel(center.status)}
                          </span>
                        </div>
                        <div class="center-card__meta">
                          <span>Disponibilite ${center.readiness}%</span>
                          <span>Equipage ${center.crew}</span>
                        </div>
                        <div class="progress">
                          <span style="width: ${center.readiness}%"></span>
                        </div>
                      </article>
                    `
                  )
                  .join("")
              : `<p class="empty-state">Aucun centre ne correspond a ce filtre.</p>`
          }
        </div>
      </div>
    </section>
  `;
}
