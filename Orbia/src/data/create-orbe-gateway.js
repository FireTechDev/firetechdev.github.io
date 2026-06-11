import { MockOrbeGateway } from "./mock-orbe-gateway.js";
import { ProxyOrbeGateway } from "./proxy-orbe-gateway.js";

const API_BASE_STORAGE_KEY = "orbia-api-base";

function resolveMode(params) {
  const requestedMode = params.get("mode");

  if (requestedMode === "mock" || requestedMode === "proxy") {
    return requestedMode;
  }

  return window.location.hostname.endsWith("github.io") ? "mock" : "proxy";
}

function resolveApiBase(params) {
  const requestedBase = params.get("apiBase");

  if (requestedBase) {
    window.localStorage.setItem(API_BASE_STORAGE_KEY, requestedBase);
    return requestedBase;
  }

  return window.localStorage.getItem(API_BASE_STORAGE_KEY) || "./api";
}

export function createOrbeGateway() {
  const params = new URLSearchParams(window.location.search);
  const mode = resolveMode(params);
  const apiBase = resolveApiBase(params);

  return {
    mode,
    apiBase,
    gateway: mode === "proxy" ? new ProxyOrbeGateway(apiBase) : new MockOrbeGateway()
  };
}
