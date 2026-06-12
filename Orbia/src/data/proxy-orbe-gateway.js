export class ProxyOrbeGateway {
  constructor(baseUrl = "./api") {
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.sessionKey = `orbia-session-token:${this.baseUrl}`;
  }

  getSessionToken() {
    return window.localStorage.getItem(this.sessionKey) || "";
  }

  setSessionToken(token) {
    if (token) {
      window.localStorage.setItem(this.sessionKey, token);
      return;
    }

    window.localStorage.removeItem(this.sessionKey);
  }

  async request(path, options = {}) {
    const token = this.getSessionToken();
    const response = await fetch(`${this.baseUrl}${path}`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {})
      },
      ...options
    });
    const nextSessionToken = response.headers.get("X-Orbia-Session");

    if (nextSessionToken) {
      this.setSessionToken(nextSessionToken);
    }

    if (response.status === 204) {
      return null;
    }

    const contentType = response.headers.get("content-type") || "";
    const payload = contentType.includes("application/json")
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      throw new Error(
        typeof payload === "string"
          ? payload
          : payload.message || payload.details?.info || "Requete Orbia indisponible."
      );
    }

    return payload;
  }

  restoreSession() {
    if (!this.getSessionToken()) {
      return Promise.resolve(null);
    }

    return this.request("/session", { method: "GET" }).then((payload) => {
      if (payload?.sessionToken) {
        this.setSessionToken(payload.sessionToken);
        return payload.profile;
      }

      return payload;
    });
  }

  signIn(credentials) {
    return this.request("/session", {
      method: "POST",
      body: JSON.stringify(credentials)
    }).then((payload) => {
      if (payload?.sessionToken) {
        this.setSessionToken(payload.sessionToken);
        return payload.profile;
      }

      return payload;
    });
  }

  signOut() {
    return this.request("/session", { method: "DELETE" }).finally(() => {
      this.setSessionToken("");
    });
  }

  getDashboard(centerId) {
    const search = centerId ? `?centerId=${encodeURIComponent(centerId)}` : "";
    return this.request(`/dashboard${search}`, { method: "GET" });
  }

  getInterventions(centerId) {
    const search = centerId ? `?centerId=${encodeURIComponent(centerId)}` : "";
    return this.request(`/interventions${search}`, { method: "GET" });
  }

  getPlanning() {
    return this.request("/planning", { method: "GET" });
  }

  createQuickShift(payload) {
    return this.request("/planning/quick-shift", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  }

  deletePlanningEntry(entryId) {
    return this.request(`/planning/entry/${encodeURIComponent(entryId)}`, {
      method: "DELETE"
    });
  }
}
