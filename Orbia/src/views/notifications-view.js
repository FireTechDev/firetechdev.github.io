function levelTone(level) {
  if (level === "critical") {
    return "danger";
  }

  if (level === "warning") {
    return "warning";
  }

  return "calm";
}

export function renderNotificationsView(state) {
  const notifications = state.notifications;

  if (!notifications) {
    return `
      <section class="screen-block">
        <div class="panel skeleton-panel">
          <p class="eyebrow">Notifications</p>
          <h2>Chargement des remontees...</h2>
        </div>
      </section>
    `;
  }

  return `
    <section class="screen-block">
      <div class="panel panel--accent">
        <div class="panel__header">
          <p class="eyebrow">Notifications</p>
          <h2>Ce qui merite une action</h2>
        </div>
        <div class="stats-grid">
          ${notifications.counters
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
          <p class="eyebrow">Flux priorise</p>
          <h3>Lecture en 1 colonne, pensee mobile</h3>
        </div>
        <div class="list-stack">
          ${notifications.items
            .map(
              (item) => `
                <article class="notification-card notification-card--${levelTone(item.level)}">
                  <div class="notification-card__topline">
                    <span class="badge badge--soft">${item.category}</span>
                    <span class="timestamp">${item.time}</span>
                  </div>
                  <h4>${item.title}</h4>
                  <p>${item.body}</p>
                </article>
              `
            )
            .join("")}
        </div>
      </div>
    </section>
  `;
}
