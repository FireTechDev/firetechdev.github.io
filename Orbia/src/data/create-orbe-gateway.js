import { MockOrbeGateway } from "./mock-orbe-gateway.js";
import { ProxyOrbeGateway } from "./proxy-orbe-gateway.js";

export function createOrbeGateway() {
  const params = new URLSearchParams(window.location.search);
  const mode = params.get("mode") === "proxy" ? "proxy" : "mock";

  return {
    mode,
    gateway: mode === "proxy" ? new ProxyOrbeGateway("/api") : new MockOrbeGateway()
  };
}
