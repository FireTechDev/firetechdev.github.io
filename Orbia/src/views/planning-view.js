export function renderPlanningView(state) {
  const planning = state.planning;

  if (!planning) {
    return `
      <section class="screen-block">
        <div class="panel skeleton-panel">
          <p class="eyebrow">Planning</p>
          <h2>Preparation du planning...</h2>
        </div>
      </section>
    `;
  }

  return `
    <section class="screen-block">
      <div class="hero-card hero-card--compact">
        <div class="hero-card__header">
          <div>
            <p class="eyebrow">Planning</p>
            <h2>${planning.nextShift.title}</h2>
          </div>
          <span class="badge badge--strong">${planning.nextShift.team}</span>
        </div>
        <div class="shift-banner">
          <strong>${planning.nextShift.date}</strong>
          <span>${planning.nextShift.time}</span>
          <p>${planning.nextShift.detail}</p>
        </div>
      </div>
    </section>

    <section class="screen-block">
      <div class="panel panel--dense">
        <div class="panel__header">
          <p class="eyebrow">Indicateurs</p>
          <h3>Vue courte pour le terrain</h3>
        </div>
        <div class="stats-grid">
          ${planning.segments
            .map(
              (item) => `
                <article class="stat-card stat-card--neutral">
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
      <div class="panel">
        <div class="panel__header">
          <p class="eyebrow">Fil de journee</p>
          <h3>Actions a venir</h3>
        </div>
        <div class="timeline">
          ${planning.roster
            .map(
              (item) => `
                <article class="timeline-item timeline-item--${item.status}">
                  <span class="timeline-item__when">${item.when}</span>
                  <strong>${item.title}</strong>
                  <p>${item.place}</p>
                </article>
              `
            )
            .join("")}
        </div>
      </div>
    </section>
  `;
}
