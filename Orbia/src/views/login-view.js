export function renderLoginView(state) {
  const { authBusy, authError } = state;

  return `
    <section class="login-screen">
      <div class="login-screen__hero">
        <h1>Orbia</h1>
      </div>

      <form class="panel panel--login" data-form="login">
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
            : ""
        }

        <button class="button button--primary button--large" type="submit" ${
          authBusy ? "disabled" : ""
        }>
          ${authBusy ? "Connexion..." : "Se connecter"}
        </button>
      </form>
    </section>
  `;
}
