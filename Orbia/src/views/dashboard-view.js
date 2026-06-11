const GRADE_ORDER = ["LTN", "ADJ", "SGT", "CPL", "SAP", "SAP1", "SP"];

function initialsFromName(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
}

function allFirefighters(center) {
  return (center.crewGroups || []).flatMap((group) => group.firefighters || []);
}

function renderGradeChips(firefighters) {
  const counts = firefighters.reduce((accumulator, firefighter) => {
    const grade = firefighter.grade || "SP";
    accumulator.set(grade, (accumulator.get(grade) || 0) + 1);
    return accumulator;
  }, new Map());

  return [...counts.entries()]
    .sort(([left], [right]) => {
      const leftIndex = GRADE_ORDER.indexOf(left);
      const rightIndex = GRADE_ORDER.indexOf(right);
      return (leftIndex === -1 ? 99 : leftIndex) - (rightIndex === -1 ? 99 : rightIndex);
    })
    .map(
      ([grade, count]) => `
        <span class="data-chip">
          ${grade} <strong>x${count}</strong>
        </span>
      `
    )
    .join("");
}

function renderFirefighterTiming(firefighter) {
  if (firefighter.shiftStartLabel && firefighter.shiftEndLabel) {
    return {
      primary: `${firefighter.shiftStartLabel} -> ${firefighter.shiftEndLabel}`,
      secondary: firefighter.shiftDurationLabel || firefighter.statusLabel
    };
  }

  return {
    primary: firefighter.statusLabel || "Disponible",
    secondary: firefighter.detail || "Programmation en cours"
  };
}

function renderAvailableFirefighter(firefighter) {
  const timing = renderFirefighterTiming(firefighter);

  return `
    <article class="availability-row">
      <div class="availability-row__identity">
        <span class="initials initials--compact">${initialsFromName(firefighter.name)}</span>
        <div>
          <h4>${firefighter.name}</h4>
          <p>${firefighter.grade || "SP"}</p>
        </div>
      </div>
      <div class="availability-row__status">
        <strong>${timing.primary}</strong>
        <span>${timing.secondary}</span>
      </div>
    </article>
  `;
}

function renderVehicleCard(armability) {
  const percent = Number.isFinite(armability.percent)
    ? armability.percent
    : armability.totalRoles
      ? Math.round((armability.availableRoles / armability.totalRoles) * 100)
      : 0;
  const isReady = Boolean(armability.available);

  return `
    <article class="armability-card ${isReady ? "armability-card--ready" : "armability-card--watch"}">
      <div class="armability-card__topline">
        <strong>${armability.name}</strong>
        <span class="status-pill ${isReady ? "status-pill--ready" : "status-pill--watch"}">
          ${isReady ? "Armable" : armability.status || "A completer"}
        </span>
      </div>
      <p>${armability.availableRoles}/${armability.totalRoles} pers.</p>
      <div class="armability-card__meter" aria-hidden="true">
        <span style="width:${Math.max(0, Math.min(percent, 100))}%"></span>
      </div>
      ${
        armability.missingRoles?.length
          ? `<small>Manque: ${armability.missingRoles.join(", ")}</small>`
          : `<small>${armability.description || "Postes couverts"}</small>`
      }
    </article>
  `;
}

export function renderDashboardView(state) {
  const dashboard = state.dashboard;

  if (!dashboard) {
    return `
      <section class="screen-block">
        <div class="panel skeleton-panel">
          <p class="eyebrow">Disponibilite</p>
          <h2>Chargement de la disponibilite...</h2>
        </div>
      </section>
    `;
  }

  const center = dashboard.center;
  const firefighters = allFirefighters(center);
  const armableCount = center.armabilities.filter((item) => item.available).length;
  const firstOperation = center.currentOperations[0];

  return `
    <section class="screen-block">
      <div class="hero-ops hero-ops--compact">
        <div class="hero-ops__header">
          <div>
            <p class="eyebrow eyebrow--light">Disponibilite</p>
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
      </div>
    </section>

    <section class="screen-block">
      <div class="panel availability-panel">
        <div class="panel__header panel__header--tight">
          <div>
            <h3>Pompiers disponibles</h3>
            <p>Aujourd'hui · mis a jour ${dashboard.updatedAt}</p>
          </div>
          <span class="badge badge--strong">${firefighters.length} dispo</span>
        </div>

        <div class="data-chip-row">
          ${renderGradeChips(firefighters)}
        </div>

        <div class="availability-list">
          ${
            firefighters.length
              ? firefighters.map((firefighter) => renderAvailableFirefighter(firefighter)).join("")
              : `<p class="empty-state">Aucun pompier disponible actuellement sur ce centre.</p>`
          }
        </div>
      </div>
    </section>

    <section class="screen-block">
      <div class="panel">
        <div class="panel__header panel__header--tight">
          <div>
            <h3>Engins armables</h3>
            <p>Lecture rapide de la capacite de depart.</p>
          </div>
          <span class="badge badge--soft">${armableCount}/${center.armabilities.length} armes</span>
        </div>

        <div class="armability-grid">
          ${
            center.armabilities.length
              ? center.armabilities.map((armability) => renderVehicleCard(armability)).join("")
              : `<p class="empty-state">Aucune armabilite detaillee remontee par Orbe.</p>`
          }
        </div>
      </div>
    </section>

    <section class="screen-block">
      <div class="panel panel--dense">
        <div class="compact-metrics">
          <article>
            <span>Interventions actuelles</span>
            <strong>${center.summary.currentInterventions}</strong>
          </article>
          <article>
            <span>Interventions 24 h</span>
            <strong>${center.summary.last24hInterventions}</strong>
          </article>
          <article>
            <span>Engins armables</span>
            <strong>${armableCount}</strong>
          </article>
        </div>
        ${
          firstOperation
            ? `
              <div class="current-operation-strip">
                <span class="incident-dot" style="--incident-color:${firstOperation.color}"></span>
                <div>
                  <strong>${firstOperation.title}</strong>
                  <p>${firstOperation.city} · depuis ${firstOperation.startedAtLabel}</p>
                </div>
              </div>
            `
            : `<p class="empty-state">Aucune intervention ne mobilise actuellement ce centre.</p>`
        }
      </div>
    </section>
  `;
}
