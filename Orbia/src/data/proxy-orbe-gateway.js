export class ProxyOrbeGateway {
  constructor(baseUrl = "./api") {
    this.baseUrl = baseUrl;
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
        typeof payload === "string" ? payload : payload.message || "Requete Orbe indisponible."
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

  getDashboard() {
    return this.request("/dashboard", { method: "GET" });
  }

  getNotifications() {
    return this.request("/notifications", { method: "GET" });
  }

  getPlanning() {
    return this.request("/planning", { method: "GET" });
  }
}
