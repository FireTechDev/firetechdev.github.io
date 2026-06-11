function renderHourOption(hours, selectedHours) {
  return `
    <label class="quick-hour ${Number(selectedHours) === hours ? "quick-hour--selected" : ""}">
      <input type="radio" name="hours" value="${hours}" ${Number(selectedHours) === hours ? "checked" : ""} />
      <span>${hours} h</span>
    </label>
  `;
}

export function renderPlanningView(state) {
  const planning = state.planning;

  if (!planning) {
    return `
      <section class="screen-block">
        <div class="panel skeleton-panel">
          <p class="eyebrow">Ma dispo</p>
          <h2>Chargement de ta disponibilite...</h2>
        </div>
      </section>
    `;
  }

  const draft = state.planningDraft || {
    hours: planning.quickOptions.defaultHours,
    positionId: planning.quickOptions.defaultPositionId
  };

  return `
    <section class="screen-block">
      <div class="hero-ops hero-ops--compact">
        <div class="hero-ops__header">
          <div>
            <p class="eyebrow eyebrow--light">Ma dispo</p>
            <h2>Programmation simple 1 a 6 h</h2>
          </div>
          <button class="button button--ghost button--light" data-action="refresh">
            Rafraichir
          </button>
        </div>
        <p class="hero-ops__note">
          Le but ici est volontairement court: te programmer vite, te deprogrammer vite, et lire ton etat sans bruit.
        </p>
      </div>
    </section>

    <section class="screen-block">
      <div class="panel panel--current-status">
        <div class="panel__header">
          <div>
            <p class="section-label">Etat actuel</p>
            <h3>${planning.current.label}</h3>
          </div>
          <span class="badge badge--strong">${planning.current.short}</span>
        </div>
        <p>${planning.current.availableNow} disponible(s) sur ${planning.current.totalPool} dans la structure ${planning.current.structureCode}.</p>
      </div>
    </section>

    <section class="screen-block">
      <div class="panel">
        <div class="panel__header">
          <div>
            <p class="section-label">Se programmer</p>
            <h3>Choisir un statut et une duree</h3>
          </div>
        </div>

        ${
          planning.quickOptions.enabled
            ? `
              <form class="quick-shift-form" data-form="quick-shift">
                <label class="field field--select">
                  <span>Statut operationnel</span>
                  <select name="positionId" data-field="planning-position">
                    ${planning.quickOptions.positions
                      .map(
                        (position) => `
                          <option value="${position.id}" ${position.id === draft.positionId ? "selected" : ""}>
                            ${position.label}
                          </option>
                        `
                      )
                      .join("")}
                  </select>
                </label>

                <div class="quick-hours">
                  ${planning.quickOptions.hours
                    .map((hours) => renderHourOption(hours, draft.hours))
                    .join("")}
                </div>

                ${
                  state.planningError
                    ? `<p class="inline-message inline-message--error">${state.planningError}</p>`
                    : ""
                }
                ${
                  state.planningMessage
                    ? `<p class="inline-message inline-message--success">${state.planningMessage}</p>`
                    : ""
                }

                <button class="button button--primary button--large" type="submit" ${
                  state.planningBusy ? "disabled" : ""
                }>
                  ${state.planningBusy ? "Programmation..." : "Me programmer"}
                </button>
              </form>
            `
            : `<p class="empty-state">Orbe ne remonte actuellement aucune disponibilite programmable.</p>`
        }
      </div>
    </section>

    <section class="screen-block">
      <div class="panel">
        <div class="panel__header">
          <div>
            <p class="section-label">Mes creneaux</p>
            <h3>Programmation et deprogrammation</h3>
          </div>
          <span class="badge badge--soft">Maj ${planning.updatedAt}</span>
        </div>

        ${
          planning.entries.length
            ? `
              <div class="list-stack">
                ${planning.entries
                  .map(
                    (entry) => `
                      <article class="planning-entry">
                        <div>
                          <div class="planning-entry__topline">
                            <strong>${entry.positionLabel}</strong>
                            <span>${entry.durationHours} h</span>
                          </div>
                          <p>${entry.startLabel} → ${entry.endLabel}</p>
                          <small>${entry.centerName} · ${entry.availabilityShort}</small>
                        </div>
                        ${
                          entry.canDelete
                            ? `
                              <button
                                class="button button--ghost button--danger"
                                data-action="delete-planning-entry"
                                data-entry-id="${entry.id}"
                              >
                                Deprogrammer
                              </button>
                            `
                            : `<span class="badge badge--soft">Passe</span>`
                        }
                      </article>
                    `
                  )
                  .join("")}
              </div>
            `
            : `<p class="empty-state">Aucun creneau programme pour le moment.</p>`
        }
      </div>
    </section>
  `;
}
