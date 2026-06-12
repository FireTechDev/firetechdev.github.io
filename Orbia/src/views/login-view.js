export function renderLoginView(state) {
  const { authBusy, authError } = state;

  return `
    <section class="login-screen">
      <div class="login-screen__hero">
        <h1>Orbia</h1>
        <p class="login-screen__subtitle">Test UI uniquement</p>
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

      <p class="login-screen__disclaimer">
        Prototype prive d'etude d'interface utilisateur, sans affiliation avec Orbe ou AUM.
        Connexion reservee aux comptes autorises et aux essais manuels. Toute automatisation
        abusive, extraction massive, contournement de securite ou utilisation hors cadre
        autorise est interdite. Certaines actions realisees apres connexion peuvent etre
        transmises au service Orbe sous la responsabilite de l'utilisateur connecte.
      </p>
    </section>
  `;
}
