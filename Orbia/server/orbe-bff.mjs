import { randomUUID } from "node:crypto";
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const HOST = process.env.HOST || "0.0.0.0";
const PORT = Number(process.env.PORT || 8787);
const ORBE_BASE_URL = process.env.ORBE_BASE_URL || "https://orbe.aum.bio";
const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "orbia_session";
const IS_PRODUCTION = process.env.NODE_ENV === "production";
const COOKIE_SECURE =
  String(process.env.COOKIE_SECURE || "").toLowerCase() === "true" || IS_PRODUCTION;
const COOKIE_SAME_SITE = process.env.COOKIE_SAME_SITE || (COOKIE_SECURE ? "None" : "Lax");
const ALLOWED_ORIGINS = new Set(
  (process.env.ALLOWED_ORIGINS || "http://localhost:8787,https://firetechdev.github.io")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
);
const PROJECT_ROOT = fileURLToPath(new URL("../", import.meta.url));
const DEFAULT_CENTER_ID = 104;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const sessions = new Map();

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webmanifest": "application/manifest+json; charset=utf-8"
};

class HttpError extends Error {
  constructor(status, message, details = null) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

class OrbeHttpError extends Error {
  constructor(status, payload) {
    const message =
      typeof payload === "string"
        ? payload
        : payload?.info || payload?.msg || payload?.message || "Requete Orbe indisponible.";

    super(message);
    this.status = status;
    this.payload = payload;
  }
}

function titleFromEmail(email = "") {
  const [localPart = "orbia"] = email.split("@");

  return localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function normalizeAvatarUrl(value) {
  if (typeof value !== "string" || !value.trim()) {
    return "";
  }

  const avatarUrl = value.trim();

  if (/^(https?:)?\/\//i.test(avatarUrl) || avatarUrl.startsWith("data:")) {
    return avatarUrl.startsWith("//") ? `https:${avatarUrl}` : avatarUrl;
  }

  try {
    return new URL(avatarUrl, ORBE_BASE_URL).toString();
  } catch {
    return "";
  }
}

function avatarCandidateUrl(value) {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return normalizeAvatarUrl(value);
  }

  if (typeof value === "object") {
    return (
      normalizeAvatarUrl(value.url) ||
      normalizeAvatarUrl(value.src) ||
      normalizeAvatarUrl(value.href) ||
      normalizeAvatarUrl(value.path) ||
      normalizeAvatarUrl(value.fileUrl)
    );
  }

  return "";
}

function avatarUrlFromProfile(me) {
  const user = me?.user || {};
  const candidates = [
    me?.avatarUrl,
    me?.photoUrl,
    me?.pictureUrl,
    me?.avatar,
    me?.photo,
    me?.picture,
    me?.profilePicture,
    user.avatarUrl,
    user.photoUrl,
    user.pictureUrl,
    user.imageUrl,
    user.avatar,
    user.photo,
    user.picture,
    user.profilePicture
  ];

  for (const candidate of candidates) {
    const avatarUrl = avatarCandidateUrl(candidate);

    if (avatarUrl) {
      return avatarUrl;
    }
  }

  return "";
}

function parseCookies(header = "") {
  return header
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((accumulator, part) => {
      const separatorIndex = part.indexOf("=");

      if (separatorIndex === -1) {
        return accumulator;
      }

      const name = part.slice(0, separatorIndex).trim();
      const value = part.slice(separatorIndex + 1).trim();
      accumulator[name] = value;
      return accumulator;
    }, {});
}

function sameOriginAllowed(origin) {
  return origin && ALLOWED_ORIGINS.has(origin);
}

function applyCorsHeaders(request, response) {
  const origin = request.headers.origin;

  if (!sameOriginAllowed(origin)) {
    return;
  }

  response.setHeader("Access-Control-Allow-Origin", origin);
  response.setHeader("Access-Control-Allow-Credentials", "true");
  response.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
  response.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  response.setHeader("Vary", "Origin");
}

function writeJson(request, response, status, payload) {
  applyCorsHeaders(request, response);
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

function writeNoContent(request, response, status = 204) {
  applyCorsHeaders(request, response);
  response.writeHead(status);
  response.end();
}

async function readJsonBody(request) {
  const chunks = [];

  for await (const chunk of request) {
    chunks.push(chunk);
  }

  if (!chunks.length) {
    return {};
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf-8"));
  } catch {
    throw new HttpError(400, "Le corps JSON est invalide.");
  }
}

function parseMaybeJson(text) {
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function getSetCookieHeaders(response) {
  if (typeof response.headers.getSetCookie === "function") {
    return response.headers.getSetCookie();
  }

  const singleHeader = response.headers.get("set-cookie");
  return singleHeader ? [singleHeader] : [];
}

function updateCookieJar(cookieJar, response) {
  for (const setCookie of getSetCookieHeaders(response)) {
    const [pair = ""] = setCookie.split(";");
    const separatorIndex = pair.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const name = pair.slice(0, separatorIndex).trim();
    const value = pair.slice(separatorIndex + 1).trim();
    cookieJar.set(name, value);
  }
}

function buildCookieHeader(cookieJar) {
  return [...cookieJar.entries()].map(([name, value]) => `${name}=${value}`).join("; ");
}

function createSessionProfile(me, fallbackEmail = "") {
  const user = me?.user || {};
  const email = user.email || fallbackEmail;
  const rawTitle = typeof me?.title === "string" ? me.title.trim() : "";
  const title = rawTitle && !/^opsready$/i.test(rawTitle) ? rawTitle : "";

  return {
    displayName: title || user.displayName || titleFromEmail(email),
    email,
    avatarUrl: avatarUrlFromProfile(me),
    territory: "SDIS 31",
    focusLabel: "Centre operationnel"
  };
}

class OrbeClient {
  constructor(record) {
    this.record = record;
  }

  async request(path, { method = "GET", body, searchParams } = {}) {
    const url = new URL(path, ORBE_BASE_URL);

    if (searchParams) {
      for (const [key, value] of Object.entries(searchParams)) {
        if (value !== undefined && value !== null && value !== "") {
          url.searchParams.set(key, String(value));
        }
      }
    }

    const headers = {
      Accept: "application/json, text/plain, */*"
    };

    if (this.record.cookies.size) {
      headers.Cookie = buildCookieHeader(this.record.cookies);
    }

    if (body !== undefined) {
      headers["Content-Type"] = "application/json";
    }

    const xsrfToken = this.record.cookies.get("XSRF-TOKEN");

    if (method !== "GET" && method !== "HEAD" && xsrfToken) {
      headers["X-XSRF-TOKEN"] = decodeURIComponent(xsrfToken);
    }

    const response = await fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      redirect: "manual"
    });

    updateCookieJar(this.record.cookies, response);
    const text = await response.text();
    const payload = parseMaybeJson(text);

    if (!response.ok) {
      throw new OrbeHttpError(response.status, payload);
    }

    this.record.updatedAt = Date.now();
    return payload;
  }
}

function createSessionRecord() {
  return {
    id: randomUUID(),
    cookies: new Map(),
    profile: null,
    updatedAt: Date.now()
  };
}

function cleanupSession(sessionId) {
  sessions.delete(sessionId);
}

function setSessionCookie(response, sessionId) {
  const attributes = [
    `${SESSION_COOKIE_NAME}=${sessionId}`,
    "HttpOnly",
    "Path=/",
    `SameSite=${COOKIE_SAME_SITE}`
  ];

  if (COOKIE_SECURE) {
    attributes.push("Secure");
  }

  response.setHeader("Set-Cookie", attributes.join("; "));
}

function clearSessionCookie(response) {
  const attributes = [
    `${SESSION_COOKIE_NAME}=`,
    "HttpOnly",
    "Path=/",
    "Max-Age=0",
    `SameSite=${COOKIE_SAME_SITE}`
  ];

  if (COOKIE_SECURE) {
    attributes.push("Secure");
  }

  response.setHeader("Set-Cookie", attributes.join("; "));
}

function sessionIdFromRequest(request) {
  const authorization = request.headers.authorization || "";
  const bearerPrefix = "Bearer ";

  if (authorization.startsWith(bearerPrefix)) {
    return authorization.slice(bearerPrefix.length).trim();
  }

  const cookies = parseCookies(request.headers.cookie || "");
  return cookies[SESSION_COOKIE_NAME];
}

function requireSessionRecord(request) {
  const sessionId = sessionIdFromRequest(request);
  const record = sessionId ? sessions.get(sessionId) : null;

  if (!record) {
    throw new HttpError(401, "Session Orbia absente ou expiree.");
  }

  return record;
}

async function ensureActiveSession(record) {
  const client = new OrbeClient(record);

  try {
    const me = await client.request("/api/me/user/details");
    record.profile = createSessionProfile(me, record.profile?.email || "");
    return { client, me };
  } catch (error) {
    if (error instanceof OrbeHttpError && error.status === 401) {
      throw new HttpError(401, "La session Orbe a expire. Reconnecte-toi.");
    }

    throw error;
  }
}

function normalizeText(value = "") {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toUpperCase();
}

function statusMetadata(label = "") {
  const normalized = normalizeText(label);

  if (normalized.includes("GARDE")) {
    return { key: "garde", group: "Garde", short: "Garde" };
  }

  if (normalized.includes("AST")) {
    return { key: "astreinte", group: "Astreinte", short: "Astreinte" };
  }

  if (normalized.includes("INTER")) {
    return { key: "inter", group: "Inter", short: "Inter" };
  }

  if (normalized.includes("DISPO 1") || normalized.includes("D1")) {
    return { key: "d1", group: "D1", short: "D1" };
  }

  if (normalized.includes("DISPONIBILITE 2") || normalized.includes(" D2")) {
    return { key: "d2", group: "D2", short: "D2" };
  }

  if (normalized.includes("DISPONIBILITE 3") || normalized.includes(" D3")) {
    return { key: "d3", group: "D3", short: "D3" };
  }

  return {
    key: "other",
    group: label || "Statut",
    short: label || "Statut"
  };
}

function formatClock(dateLike) {
  const date = new Date(dateLike);

  if (Number.isNaN(date.getTime())) {
    return "--:--";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Paris"
  }).format(date);
}

function formatDateTime(dateLike) {
  const date = new Date(dateLike);

  if (Number.isNaN(date.getTime())) {
    return "Aucune date";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Paris"
  }).format(date);
}

function parseGps(gpscoord) {
  const [lat, lng] = String(gpscoord || "")
    .split(",")
    .map((value) => Number(value.trim()));

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  return { lat, lng };
}

function isActiveOperation(operation) {
  return operation?.isFinished === false || operation?.finished === false;
}

function isWithinLast24Hours(dateLike) {
  const timestamp = new Date(dateLike).getTime();
  return Number.isFinite(timestamp) && timestamp >= Date.now() - ONE_DAY_MS;
}

function buildCenterStatusLookup(center) {
  return new Map(
    (center.positionsAdministratives || []).map((item) => [Number(item.id), item.libelle || `Statut ${item.id}`])
  );
}

function mapStatusChips(center) {
  const aggregates = new Map();

  for (const item of center.positionsAdministratives || []) {
    if (!item.count) {
      continue;
    }

    const status = statusMetadata(item.libelle);
    const previous = aggregates.get(status.key) || { key: status.key, label: status.short, count: 0 };
    previous.count += Number(item.count || 0);
    aggregates.set(status.key, previous);
  }

  const order = ["garde", "astreinte", "d1", "d2", "d3", "inter", "other"];

  return [...aggregates.values()].sort(
    (left, right) => order.indexOf(left.key) - order.indexOf(right.key)
  );
}

function mapArmabilities(detailArmabilities = []) {
  return detailArmabilities.map((armability) => {
    const roles = armability.items || [];
    const availableRoles = roles.filter((item) => item.available).length;
    const totalRoles = roles.length;

    return {
      name: armability.name,
      status: armability.available ? "Armable" : "A completer",
      description: armability.description,
      available: Boolean(armability.available),
      availableRoles,
      totalRoles,
      percent: totalRoles ? Math.round((availableRoles / totalRoles) * 100) : 0,
      missingRoles: roles.filter((item) => !item.available).map((item) => item.name),
      roles: roles.map((item) => ({
        code: item.cod,
        label: item.name,
        available: Boolean(item.available)
      }))
    };
  });
}

function computeArmabilityPercent(armabilities) {
  const totals = armabilities.reduce(
    (accumulator, item) => {
      accumulator.available += item.availableRoles;
      accumulator.total += item.totalRoles;
      return accumulator;
    },
    { available: 0, total: 0 }
  );

  return totals.total ? Math.round((totals.available / totals.total) * 100) : 0;
}

function mapFirefighters(center, centerDetails) {
  const statusLookup = buildCenterStatusLookup(center);

  return (centerDetails.availableFirefighters || []).map((firefighter) => {
    const rawStatusLabel = statusLookup.get(Number(firefighter.status)) || `Statut ${firefighter.status}`;
    const status = statusMetadata(rawStatusLabel);

    return {
      id: String(firefighter.idFirefighter || firefighter.cod || firefighter.name),
      name: firefighter.name,
      grade: firefighter.grade,
      statusKey: status.key,
      statusGroup: status.group,
      statusLabel: rawStatusLabel,
      detail: firefighter.lastDepartureTime
        ? `Dernier depart ${formatDateTime(firefighter.lastDepartureTime)}`
        : "Aucun depart recent",
      skillHighlights: (firefighter.skills || []).slice(0, 3)
    };
  });
}

function groupFirefighters(firefighters) {
  const groups = new Map();
  const order = ["Garde", "Astreinte", "D1", "D2", "D3", "Inter"];

  for (const firefighter of firefighters) {
    if (!groups.has(firefighter.statusGroup)) {
      groups.set(firefighter.statusGroup, []);
    }

    groups.get(firefighter.statusGroup).push(firefighter);
  }

  return [...groups.entries()]
    .sort((left, right) => {
      const leftIndex = order.indexOf(left[0]);
      const rightIndex = order.indexOf(right[0]);

      return (leftIndex === -1 ? 99 : leftIndex) - (rightIndex === -1 ? 99 : rightIndex);
    })
    .map(([label, members]) => ({
      key: statusMetadata(label).key,
      label,
      count: members.length,
      firefighters: members
    }));
}

function operationsForCenter(operations, centerId) {
  return operations.filter((operation) =>
    (operation.vehicles || []).some((vehicle) => Number(vehicle.idCenter) === Number(centerId))
  );
}

function mapActiveOperations(operations, centers) {
  const centerNameLookup = new Map(centers.map((center) => [Number(center.idCenter), center.name]));

  return operations
    .filter(isActiveOperation)
    .map((operation) => {
      const gps = parseGps(operation.gpscoord);
      const centerIds = [
        ...new Set(
          (operation.vehicles || [])
            .map((vehicle) => Number(vehicle.idCenter))
            .filter((value) => Number.isFinite(value))
        )
      ];
      const centerNames = [
        ...new Set(
          centerIds
            .map((centerId) => centerNameLookup.get(centerId))
            .filter(Boolean)
        )
      ];

      return {
        id: String(operation.id),
        title: operation.title,
        city: operation.city || "Secteur non precise",
        startTime: operation.startTime,
        startedAtLabel: formatClock(operation.startTime),
        vehicleCount: operation.vehicleCount || (operation.vehicles || []).length,
        firefighterCount: operation.firefighterCount || 0,
        color: operation.operationColor || "#0d7c71",
        gps,
        centerIds,
        centers: centerNames
      };
    })
    .sort((left, right) => new Date(right.startTime).getTime() - new Date(left.startTime).getTime());
}

function defaultCenterIdFromList(centers) {
  const preferred = centers.find((center) => Number(center.idCenter) === DEFAULT_CENTER_ID);
  return String(preferred?.idCenter || centers[0]?.idCenter || DEFAULT_CENTER_ID);
}

function mapCenterOptions(centers, operations) {
  const defaultId = defaultCenterIdFromList(centers);

  return centers
    .map((center) => {
      const relatedOperations = operationsForCenter(operations, center.idCenter);

      return {
        id: String(center.idCenter),
        name: center.name,
        stationLabel: center.abbrev || center.cod || center.name,
        activeInterventions: relatedOperations.filter(isActiveOperation).length,
        last24hInterventions: relatedOperations.filter((operation) =>
          isWithinLast24Hours(operation.startTime)
        ).length
      };
    })
    .sort((left, right) => {
      if (left.id === defaultId) {
        return -1;
      }

      if (right.id === defaultId) {
        return 1;
      }

      return left.name.localeCompare(right.name, "fr-FR");
    });
}

function mapDashboard(profile, centers, center, centerDetails, operations) {
  const activeIncidents = mapActiveOperations(operations, centers);
  const centerOperations = activeIncidents.filter((incident) =>
    incident.centerIds.includes(Number(center.idCenter))
  );
  const armabilities = mapArmabilities(centerDetails.detailArmabilities || []);
  const firefighters = mapFirefighters(center, centerDetails);
  const recentCount = operationsForCenter(operations, center.idCenter).filter((operation) =>
    isWithinLast24Hours(operation.startTime)
  ).length;

  return {
    profile,
    updatedAt: formatClock(Date.now()),
    defaultCenterId: defaultCenterIdFromList(centers),
    centers: mapCenterOptions(centers, operations),
    center: {
      id: String(center.idCenter),
      name: center.name,
      stationLabel: center.abbrev || center.cod || center.name,
      note:
        Number(center.idCenter) === DEFAULT_CENTER_ID
          ? "Centre prioritaire au chargement. Les autres centres restent consultables dans le menu."
          : "Lecture centre par centre avec la meme synthese mobile.",
      armabilityPercent: computeArmabilityPercent(armabilities),
      summary: {
        availableFirefighters: firefighters.length,
        armableVehicles: armabilities.filter((item) => item.available).length,
        currentInterventions: centerOperations.length,
        last24hInterventions: recentCount
      },
      statusChips: mapStatusChips(center),
      crewGroups: groupFirefighters(firefighters),
      armabilities,
      currentOperations: centerOperations
    }
  };
}

function mapInterventions(centers, operations, selectedCenterId) {
  const activeIncidents = mapActiveOperations(operations, centers);
  const centerId = Number(selectedCenterId);

  return {
    updatedAt: formatClock(Date.now()),
    activeCount: activeIncidents.length,
    centerActiveCount: activeIncidents.filter((incident) => incident.centerIds.includes(centerId)).length,
    incidents: activeIncidents
  };
}

function mapPlanning(levels, planningEntries, dateLimits) {
  const now = Date.now();
  const level = levels[0] || {};
  const availabilityStatuses = level.structure?.etatsDisponibilitesPossibles || [];
  const availableStatus =
    availabilityStatuses.find(
      (status) => status.estDisponible && (status.positionsAdministrativesPossibles || []).length
    ) || null;
  const unavailableStatus = selectAvailabilityStatus(level, "INDISPONIBLE_0", "unavailable");
  const availablePositions = availableStatus?.positionsAdministrativesPossibles || [];

  const entries = [...planningEntries]
    .sort((left, right) => new Date(left.startTime).getTime() - new Date(right.startTime).getTime())
    .map((entry) => {
      const startTime = new Date(entry.startTime);
      const endTime = new Date(entry.endTime);
      const durationMs = endTime.getTime() - startTime.getTime();

      return {
        id: entry.id,
        startTime: entry.startTime,
        endTime: entry.endTime,
        startLabel: formatDateTime(entry.startTime),
        endLabel: formatDateTime(entry.endTime),
        durationHours: Math.max(0, Math.round((durationMs / 3600000) * 10) / 10),
        centerName: entry.centerName,
        availabilityShort: entry.availabilityStatusAbbrev,
        availabilityCode: entry.availabilityStatusCod,
        positionCode: entry.positionAdministrativeCod,
        positionLabel: entry.positionAdministrativeLabel,
        isFuture: endTime.getTime() > now,
        canDelete: endTime.getTime() > now
      };
    });

  return {
    updatedAt: formatClock(Date.now()),
    current: {
      short:
        level.disponibiliteEnCours?.etatDisponibilite?.libelleCourt || "ND",
      label:
        level.disponibiliteEnCours?.etatDisponibilite?.libelle || "Non declenchable",
      structureCode: level.structure?.code || "031-VILLEFRANC",
      availableNow: level.structure?.effectifsDisponible?.dispoActuellement || 0,
      totalPool: level.structure?.effectifsDisponible?.totalDispo || 0
    },
    quickOptions: {
      enabled: Boolean(availableStatus || unavailableStatus),
      hours: [1, 2, 3, 4, 5, 6],
      defaultHours: 2,
      maxDurationDays: dateLimits?.max_duration_days || 7,
      affectationId: level.idAffectation || null,
      canDeclareAvailable: Boolean(availableStatus && availablePositions.length),
      canDeclareUnavailable: Boolean(unavailableStatus),
      availabilityCode: availableStatus?.code || null,
      availabilityShort: availableStatus?.libelleCourt || null,
      availabilityLabel: availableStatus?.libelle || null,
      unavailableCode: unavailableStatus?.code || null,
      unavailableShort: unavailableStatus?.libelleCourt || null,
      unavailableLabel: unavailableStatus?.libelle || null,
      positions: availablePositions.map((position) => ({
        id: position.idNexsis,
        code: position.code,
        label: position.libelle
      })),
      defaultPositionId: availablePositions[0]?.idNexsis || null
    },
    entries
  };
}

function selectAvailabilityStatus(level, requestedCode, mode = "available") {
  const statuses = level.structure?.etatsDisponibilitesPossibles || [];
  const normalizedRequestedCode = String(requestedCode || "").trim();

  if (normalizedRequestedCode) {
    const requested = statuses.find((status) => status.code === normalizedRequestedCode);

    if (requested) {
      return requested;
    }
  }

  if (mode === "unavailable") {
    return (
      statuses.find((status) => status.code === "INDISPONIBLE_0") ||
      statuses.find((status) => status.estDisponible === false) ||
      statuses.find((status) => normalizeText(`${status.code || ""} ${status.libelle || ""}`).includes("INDISPONIBLE")) ||
      null
    );
  }

  return (
    statuses.find(
      (status) => status.estDisponible && (status.positionsAdministrativesPossibles || []).length
    ) || null
  );
}

async function loadDashboard(record, selectedCenterId) {
  const client = new OrbeClient(record);
  const [centers, operations] = await Promise.all([
    client.request("/api/me/centers"),
    client.request("/api/me/operations")
  ]);

  const defaultCenterId = defaultCenterIdFromList(centers);
  const resolvedCenterId = String(selectedCenterId || defaultCenterId);
  const center =
    centers.find((item) => String(item.idCenter) === resolvedCenterId) ||
    centers.find((item) => String(item.idCenter) === defaultCenterId) ||
    centers[0];

  if (!center) {
    throw new HttpError(404, "Aucun centre disponible pour cette session.");
  }

  const centerDetails = await client.request(`/api/me/centers/${center.idCenter}/details`);
  return mapDashboard(record.profile, centers, center, centerDetails, operations);
}

async function loadInterventions(record, selectedCenterId) {
  const client = new OrbeClient(record);
  const [centers, operations] = await Promise.all([
    client.request("/api/me/centers"),
    client.request("/api/me/operations")
  ]);

  return mapInterventions(centers, operations, selectedCenterId || defaultCenterIdFromList(centers));
}

async function loadPlanning(record) {
  const client = new OrbeClient(record);
  const [planningEntries, levels, dateLimits] = await Promise.all([
    client.request("/api/me/planning"),
    client.request("/api/nexsis/v1/disponibilites/en-cours"),
    client.request("/api/me/planning/date-limits")
  ]);

  return mapPlanning(levels, planningEntries, dateLimits);
}

async function createQuickShift(record, payload) {
  const hours = Number(payload.hours);

  if (!Number.isFinite(hours) || hours < 1 || hours > 6) {
    throw new HttpError(400, "Choisis une duree entre 1 h et 6 h.");
  }

  const client = new OrbeClient(record);
  const levels = await client.request("/api/nexsis/v1/disponibilites/en-cours");

  const level = levels[0] || {};
  const availabilityMode = payload.availabilityMode === "unavailable" ? "unavailable" : "available";
  const availability = selectAvailabilityStatus(
    level,
    availabilityMode === "unavailable" ? payload.unavailableCode : payload.availabilityCode,
    availabilityMode
  );

  if (!availability) {
    throw new HttpError(
      400,
      availabilityMode === "unavailable"
        ? "Aucune indisponibilite programmable n'est exposee par Orbe."
        : "Aucune disponibilite programmable n'est exposee par Orbe."
    );
  }

  const availablePositions = availability.positionsAdministrativesPossibles || [];
  const position =
    availablePositions.find(
      (item) => item.idNexsis === payload.positionId
    ) || availablePositions[0];

  if (availablePositions.length && !position) {
    throw new HttpError(400, "Choisis un statut operationnel pour te programmer.");
  }

  if (!level.idAffectation) {
    throw new HttpError(400, "Affectation Orbe introuvable pour cette session.");
  }

  const now = new Date();
  const end = new Date(now.getTime() + hours * 3600000);

  // This mirrors Orbe's official Angular service for /nexsis/v1/disponibilites/demande.
  const requestBody = {
    dateDeDebut: now.toISOString(),
    dateDeFin: end.toISOString(),
    idPositionAdministrative: position?.idNexsis ?? null,
    idAffectation: level.idAffectation,
    etatDisponibilite: availability.code
  };

  await client.request("/api/nexsis/v1/disponibilites/demande", {
    method: "POST",
    body: requestBody
  });

  return loadPlanning(record);
}

async function deletePlanningEntry(record, entryId) {
  const client = new OrbeClient(record);
  await client.request(`/api/me/planning/entry/${entryId}`, { method: "DELETE" });
}

function resolveStaticPath(pathname) {
  const safePath = pathname === "/" ? "/index.html" : pathname;
  const normalizedPath = normalize(safePath).replace(/^(\.\.[/\\])+/, "");
  return join(PROJECT_ROOT, normalizedPath);
}

async function serveStaticFile(request, response, pathname) {
  const targetPath = resolveStaticPath(pathname);

  if (!targetPath.startsWith(PROJECT_ROOT)) {
    throw new HttpError(403, "Chemin refuse.");
  }

  let filePath = targetPath;

  try {
    const targetStat = await stat(filePath);

    if (targetStat.isDirectory()) {
      filePath = join(filePath, "index.html");
    }
  } catch {
    if (pathname !== "/" && !extname(pathname)) {
      filePath = join(PROJECT_ROOT, "index.html");
    } else {
      throw new HttpError(404, "Fichier introuvable.");
    }
  }

  const extension = extname(filePath);
  const content = await readFile(filePath);

  response.writeHead(200, {
    "Content-Type": MIME_TYPES[extension] || "application/octet-stream",
    "Cache-Control": extension === ".html" ? "no-store" : "public, max-age=300"
  });
  response.end(content);
}

async function handleApiRequest(request, response, url) {
  if (request.method === "OPTIONS") {
    writeNoContent(request, response);
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/health") {
    writeJson(request, response, 200, {
      ok: true,
      service: "orbia-bff",
      orbeBaseUrl: ORBE_BASE_URL
    });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/session") {
    const body = await readJsonBody(request);
    const email = String(body.email || "").trim();
    const password = String(body.password || "");

    if (!email || !password) {
      throw new HttpError(400, "Renseigne ton email et ton mot de passe.");
    }

    const record = createSessionRecord();
    const client = new OrbeClient(record);

    await client.request("/api/auth/cookie", {
      method: "POST",
      body: {
        username: email,
        password
      }
    });

    const me = await client.request("/api/me/user/details");
    record.profile = createSessionProfile(me, email);
    sessions.set(record.id, record);

    applyCorsHeaders(request, response);
    response.setHeader("Access-Control-Expose-Headers", "X-Orbia-Session");
    response.setHeader("X-Orbia-Session", record.id);
    setSessionCookie(response, record.id);
    response.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    response.end(JSON.stringify({ profile: record.profile, sessionToken: record.id }));
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/session") {
    const record = requireSessionRecord(request);
    await ensureActiveSession(record);
    applyCorsHeaders(request, response);
    response.setHeader("Access-Control-Expose-Headers", "X-Orbia-Session");
    response.setHeader("X-Orbia-Session", record.id);
    response.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    response.end(JSON.stringify({ profile: record.profile, sessionToken: record.id }));
    return;
  }

  if (request.method === "DELETE" && url.pathname === "/api/session") {
    const sessionId = sessionIdFromRequest(request);
    const record = sessionId ? sessions.get(sessionId) : null;

    if (record) {
      try {
        const client = new OrbeClient(record);
        await client.request("/api/logout", { method: "POST" });
      } catch {
        // We still clear the local session even if the remote logout fails.
      }
    }

    if (sessionId) {
      cleanupSession(sessionId);
    }

    applyCorsHeaders(request, response);
    clearSessionCookie(response);
    response.writeHead(204);
    response.end();
    return;
  }

  const record = requireSessionRecord(request);
  await ensureActiveSession(record);

  if (request.method === "GET" && url.pathname === "/api/dashboard") {
    const payload = await loadDashboard(record, url.searchParams.get("centerId"));
    writeJson(request, response, 200, payload);
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/interventions") {
    const payload = await loadInterventions(record, url.searchParams.get("centerId"));
    writeJson(request, response, 200, payload);
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/planning") {
    const payload = await loadPlanning(record);
    writeJson(request, response, 200, payload);
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/planning/quick-shift") {
    const body = await readJsonBody(request);
    const payload = await createQuickShift(record, body);
    writeJson(request, response, 200, payload);
    return;
  }

  if (request.method === "DELETE" && url.pathname.startsWith("/api/planning/entry/")) {
    const entryId = url.pathname.split("/").pop();

    if (!entryId) {
      throw new HttpError(400, "Entree de planning manquante.");
    }

    await deletePlanningEntry(record, entryId);
    writeNoContent(request, response);
    return;
  }

  throw new HttpError(404, "Endpoint API inconnu.");
}

const server = createServer(async (request, response) => {
  if (!request.url) {
    writeJson(request, response, 400, { message: "Requete invalide." });
    return;
  }

  const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);

  try {
    if (url.pathname.startsWith("/api/")) {
      await handleApiRequest(request, response, url);
      return;
    }

    if (request.method !== "GET" && request.method !== "HEAD") {
      throw new HttpError(405, "Methode non autorisee.");
    }

    await serveStaticFile(request, response, url.pathname);
  } catch (error) {
    const status = error instanceof HttpError ? error.status : error instanceof OrbeHttpError ? error.status : 500;
    const message =
      error instanceof HttpError || error instanceof OrbeHttpError
        ? error.message
        : "Erreur interne Orbia.";
    const details =
      error instanceof HttpError
        ? error.details
        : error instanceof OrbeHttpError
          ? error.payload
          : null;

    if (!response.headersSent) {
      writeJson(request, response, status, {
        message,
        details
      });
    } else {
      response.end();
    }
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Orbia disponible sur http://${HOST}:${PORT}`);
});
