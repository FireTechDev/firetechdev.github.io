export function renderLoginView(state) {
  const { authBusy, authError, mode } = state;

  return `
    <section class="login-screen">
      <div class="login-screen__hero">
        <p class="eyebrow">PWA mobile-first</p>
        <h1>Orbia</h1>
        <p class="lead">
          Une surcouche plus claire, plus rapide et plus lisible pour les usages terrain.
        </p>
        <div class="hero-badges">
          <span class="badge badge--soft">Mode ${mode === "proxy" ? "connecte" : "prototype"}</span>
          <span class="badge badge--soft">Instalable sur mobile</span>
        </div>
      </div>

      <form class="panel panel--login" data-form="login">
        <div class="panel__header">
          <p class="eyebrow">Connexion</p>
          <h2>Acceder a l'espace terrain</h2>
        </div>

        <label class="field">
          <span>Email</span>
          <input
            name="email"
            type="email"
            inputmode="email"
            autocomplete="username"
            placeholder="prenom.nom@sdis31.fr"
            required
          />
        </label>

        <label class="field">
          <span>Mot de passe</span>
          <input
            name="password"
            type="password"
            autocomplete="current-password"
            placeholder="Votre mot de passe"
            required
          />
        </label>

        ${
          authError
            ? `<p class="inline-message inline-message--error">${authError}</p>`
            : `<p class="inline-message">La version prototype accepte n'importe quelle combinaison non vide.</p>`
        }

        <button class="button button--primary button--large" type="submit" ${
          authBusy ? "disabled" : ""
        }>
          ${authBusy ? "Connexion..." : "Entrer dans Orbia"}
        </button>
      </form>
    </section>
  `;
}
