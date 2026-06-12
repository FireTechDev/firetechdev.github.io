const HOUR_OPTIONS = ["06:00", "08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00", "00:00", "02:00", "04:00"];

function compactPositionLabel(position) {
  const raw = position.code || position.label || "D1";

  if (/CATE/i.test(raw) || /CATE/i.test(position.label || "")) {
    return "D1 CATE";
  }

  if (/EQ\/CE/i.test(raw) || /EQ\/CE/i.test(position.label || "")) {
    return "D1 EQ/CE";
  }

  if (/CA1E/i.test(raw) || /CA1E/i.test(position.label || "")) {
    return "D1 CA1E";
  }

  if (/D2/i.test(raw)) {
    return "D2";
  }

  if (/D3/i.test(raw)) {
    return "D3";
  }

  return position.label || raw;
}

function positionDescription(position) {
  const label = `${position.code || ""} ${position.label || ""}`.toUpperCase();

  if (label.includes("CATE")) {
    return "Chef d'agres tous engins";
  }

  if (label.includes("EQ/CE")) {
    return "Equipier / Chef d'Equipe";
  }

  if (label.includes("CA1E")) {
    return "Chef d'agres une equipe";
  }

  if (label.includes("D2")) {
    return "Disponibilite partielle";
  }

  if (label.includes("D3")) {
    return "Astreinte";
  }

  return "Equipier";
}

function selectedPosition(planning, draft) {
  return (
    planning.quickOptions.positions.find((position) => position.id === draft.positionId) ||
    planning.quickOptions.positions[0] ||
    null
  );
}

function renderAvailabilityMode(draft) {
  const mode = draft.availabilityMode || "available";

  return `
    <div class="segmented-control" role="radiogroup" aria-label="Disponibilite">
      <label class="segmented-control__item ${mode === "available" ? "segmented-control__item--active" : ""}">
        <input type="radio" name="availabilityMode" value="available" data-field="planning-availability-mode" ${mode === "available" ? "checked" : ""} />
        <span>Disponible</span>
      </label>
      <label class="segmented-control__item ${mode === "unavailable" ? "segmented-control__item--active" : ""}">
        <input type="radio" name="availabilityMode" value="unavailable" data-field="planning-availability-mode" ${mode === "unavailable" ? "checked" : ""} />
        <span>Indisponible</span>
      </label>
    </div>
  `;
}

function renderPositionCards(planning, draft) {
  return planning.quickOptions.positions
    .map(
      (position) => `
        <label class="position-option ${position.id === draft.positionId ? "position-option--selected" : ""}">
          <input
            type="radio"
            name="positionId"
            value="${position.id}"
            data-field="planning-position"
            ${position.id === draft.positionId ? "checked" : ""}
          />
          <span class="position-option__mark"></span>
          <span>
            <strong>${compactPositionLabel(position)}</strong>
            <small>${positionDescription(position)}</small>
          </span>
        </label>
      `
    )
    .join("");
}

function renderPeriodMode(draft) {
  const mode = draft.periodMode || "duration";

  return `
    <div class="period-heading">
      <p class="section-label">Periode</p>
      <div class="inline-toggle" role="radiogroup" aria-label="Mode de periode">
        <label class="${mode === "duration" ? "inline-toggle__item--active" : ""}">
          <input type="radio" name="periodMode" value="duration" data-field="planning-period-mode" ${mode === "duration" ? "checked" : ""} />
          <span>Duree</span>
        </label>
        <label class="${mode === "hour" ? "inline-toggle__item--active" : ""}">
          <input type="radio" name="periodMode" value="hour" data-field="planning-period-mode" ${mode === "hour" ? "checked" : ""} />
          <span>Heure</span>
        </label>
      </div>
    </div>
  `;
}

function renderDurationPicker(planning, draft) {
  const hours = Number(draft.hours || planning.quickOptions.defaultHours || 2);
  const min = Math.min(...planning.quickOptions.hours);
  const max = Math.max(...planning.quickOptions.hours);

  return `
    <div class="duration-picker">
      <div class="duration-picker__summary">
        <strong>${hours}</strong>
        <span>h</span>
        <p>Debut<br /><b>Maintenant</b></p>
      </div>
      <input
        type="range"
        min="${min}"
        max="${max}"
        step="1"
        name="hours"
        value="${hours}"
        data-field="planning-hours"
        aria-label="Duree de disponibilite"
      />
      <div class="duration-picker__ticks">
        ${planning.quickOptions.hours.map((item) => `<span class="${item === hours ? "is-selected" : ""}">${item}h</span>`).join("")}
      </div>
    </div>
  `;
}

function renderHourPicker(draft) {
  const selectedHour = draft.endHour || "18:00";

  return `
    <div class="hour-picker">
      <p>Disponible jusqu'a :</p>
      <div class="hour-picker__grid">
        ${HOUR_OPTIONS.map(
          (hour) => `
            <label class="${hour === selectedHour ? "hour-picker__item--selected" : ""}">
              <input type="radio" name="endHour" value="${hour}" data-field="planning-end-hour" ${hour === selectedHour ? "checked" : ""} />
              <span>${hour}</span>
            </label>
          `
        ).join("")}
      </div>
    </div>
  `;
}

function entryDayLabel(entry) {
  const date = new Date(entry.startTime);

  if (Number.isNaN(date.getTime())) {
    return "A venir";
  }

  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);

  if (date.toDateString() === tomorrow.toDateString()) {
    return "Demain";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "short",
    day: "2-digit",
    month: "short"
  }).format(date);
}

function entryStatus(entry) {
  const isUnavailable = /INDISP|ABS|ND/i.test(
    `${entry.availabilityCode || ""} ${entry.availabilityShort || ""} ${entry.positionLabel || ""}`
  );

  return {
    label: isUnavailable ? "Indispo" : "Dispo",
    className: isUnavailable ? "planning-entry--unavailable" : "planning-entry--available"
  };
}

function renderPlanningEntry(entry) {
  const status = entryStatus(entry);

  return `
    <article class="planning-entry planning-entry--figma ${status.className}">
      <div>
        <div class="planning-entry__topline">
          <strong>${entryDayLabel(entry)}</strong>
          <span class="data-chip">${entry.positionCode || entry.positionLabel}</span>
        </div>
        <p>${entry.startLabel} · ${entry.durationHours}h</p>
      </div>
      <div class="planning-entry__actions">
        <span>${status.label}</span>
        ${
          entry.canDelete
            ? `
              <button
                class="icon-button icon-button--danger"
                data-action="delete-planning-entry"
                data-entry-id="${entry.id}"
                aria-label="Deprogrammer"
              >
                x
              </button>
            `
            : `<span class="badge badge--soft">Passe</span>`
        }
      </div>
    </article>
  `;
}

export function renderPlanningView(state) {
  const planning = state.planning;

  if (!planning) {
    return `
      <section class="screen-block">
        <div class="panel skeleton-panel">
          <p class="eyebrow">Planning</p>
          <h2>Chargement de ta disponibilite...</h2>
        </div>
      </section>
    `;
  }

  const draft = state.planningDraft || {
    availabilityMode: "available",
    periodMode: "duration",
    endHour: "18:00",
    hours: planning.quickOptions.defaultHours,
    positionId: planning.quickOptions.defaultPositionId
  };
  const position = selectedPosition(planning, draft);
  const positionLabel = position ? compactPositionLabel(position) : "Statut";
  const isUnavailableMode = draft.availabilityMode === "unavailable";
  const periodLabel =
    draft.periodMode === "hour"
      ? `jusqu'a ${draft.endHour || "18:00"}`
      : `${draft.hours || planning.quickOptions.defaultHours}h`;
  const actionLabel =
    isUnavailableMode
      ? `Declarer indisponible · ${periodLabel}`
      : draft.periodMode === "hour"
      ? `Declarer dispo · ${positionLabel} · jusqu'a ${draft.endHour || "18:00"}`
      : `Declarer dispo · ${positionLabel} · ${draft.hours || planning.quickOptions.defaultHours}h`;
  const canSubmit = isUnavailableMode
    ? planning.quickOptions.canDeclareUnavailable
    : planning.quickOptions.canDeclareAvailable;

  return `
    <section class="screen-block">
      <div class="hero-ops hero-ops--compact">
        <div class="hero-ops__header">
          <div>
            <p class="eyebrow eyebrow--light">Planning</p>
            <h2>Declarer une disponibilite</h2>
          </div>
          <button class="button button--ghost button--light" data-action="refresh">
            Rafraichir
          </button>
        </div>
        <p class="hero-ops__note">Aujourd'hui · ${new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "long", year: "numeric" }).format(new Date())}</p>
      </div>
    </section>

    <form class="screen-block planning-form" data-form="quick-shift">
      <div class="panel">
        ${renderAvailabilityMode(draft)}
      </div>

      ${
        isUnavailableMode
          ? ""
          : `
            <div class="planning-section-title">
              <p class="section-label">Type de disponibilite</p>
            </div>

            <div class="position-list">
              ${
                planning.quickOptions.enabled
                  ? renderPositionCards(planning, draft)
                  : `<p class="empty-state">Orbe ne remonte actuellement aucune disponibilite programmable.</p>`
              }
            </div>
          `
      }

      ${renderPeriodMode(draft)}

      <div class="panel">
        ${
          (draft.periodMode || "duration") === "hour"
            ? renderHourPicker(draft)
            : renderDurationPicker(planning, draft)
        }
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

      <button
        class="button button--primary button--large planning-submit"
        type="submit"
        ${state.planningBusy || !canSubmit ? "disabled" : ""}
      >
        ${
          state.planningBusy
            ? "Programmation..."
            : actionLabel
        }
      </button>
    </form>

    <section class="screen-block">
      <div class="panel upcoming-panel">
        <div class="panel__header panel__header--tight">
          <div>
            <h3>Programmations a venir</h3>
            <p>Maj ${planning.updatedAt}</p>
          </div>
          <button class="button button--ghost button--danger" type="button">+ Ajouter</button>
        </div>

        ${
          planning.entries.length
            ? `<div class="list-stack">${planning.entries.map((entry) => renderPlanningEntry(entry)).join("")}</div>`
            : `<p class="empty-state">Aucun creneau programme pour le moment.</p>`
        }
      </div>
    </section>
  `;
}
