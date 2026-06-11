export class ProxyOrbeGateway {
  constructor(baseUrl = "./api") {
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  async request(path, options = {}) {
    const response = await fetch(`${this.baseUrl}${path}`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      },
      ...options
    });

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
    return this.request("/session", { method: "GET" });
  }

  signIn(credentials) {
    return this.request("/session", {
      method: "POST",
      body: JSON.stringify(credentials)
    });
  }

  signOut() {
    return this.request("/session", { method: "DELETE" });
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
