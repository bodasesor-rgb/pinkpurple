/**
 * Cliente único de la API de Nexus.
 *
 * Todas las llamadas salen por `/api/*`, que en Netlify resuelve a la función
 * `nexus-proxy`: esa función lee la cookie httpOnly de sesión y reenvía la
 * petición a NEXUS_API_URL con el header `Authorization: Bearer <token>`.
 * Así el token nunca queda expuesto al JavaScript del navegador.
 *
 * En local se puede apuntar a otro origen con VITE_API_BASE.
 */
import {
  mockBilling,
  mockConnections,
  mockConnectionTest,
  mockJobs,
  mockPaginated,
  mockPlanUsage,
  mockProjects,
  mockUser,
  mockWarn,
} from './mock';
import type {
  AuthUser,
  BillingSummary,
  Connection,
  ConnectionInput,
  ConnectionTestResult,
  GenerateInput,
  Job,
  JobStatus,
  LoginInput,
  Paginated,
  PlanUsage,
  Project,
  ProjectInput,
  RegisterInput,
  ResetPasswordInput,
  Session,
} from './types';

export const API_BASE = (import.meta.env.VITE_API_BASE ?? '/api').replace(/\/$/, '');

/** Permite levantar el panel sin Nexus: VITE_USE_MOCKS=true */
const FORCE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

/** Endpoints que Nexus todavía no expone: siempre responden mock. */
const MOCK_ONLY = {
  billing: true,
} as const;

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly details?: unknown;

  constructor(message: string, status: number, code?: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  get isNetwork(): boolean {
    return this.status === 0;
  }
}

/** Evento global para que AuthContext cierre sesión ante un 401. */
export const UNAUTHORIZED_EVENT = 'pp:unauthorized';

type Query = Record<string, string | number | boolean | undefined | null>;

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  query?: Query;
  signal?: AbortSignal;
  /** No emitir el evento de sesión caducada (login, registro…). */
  skipAuthEvent?: boolean;
}

function buildUrl(path: string, query?: Query): string {
  const url = `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
  if (!query) return url;
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    params.set(key, String(value));
  });
  const qs = params.toString();
  return qs ? `${url}?${qs}` : url;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, query, signal, skipAuthEvent } = options;

  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      signal,
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    if ((err as Error)?.name === 'AbortError') throw err;
    throw new ApiError('No se pudo conectar con el servidor. Revisa tu conexión.', 0);
  }

  if (response.status === 204) return undefined as T;

  const raw = await response.text();
  let data: unknown = null;
  if (raw) {
    try {
      data = JSON.parse(raw);
    } catch {
      data = raw;
    }
  }

  if (!response.ok) {
    const payload = (data ?? {}) as { error?: string; message?: string; code?: string };
    const message =
      payload.error ||
      payload.message ||
      (response.status === 401
        ? 'Tu sesión expiró. Inicia sesión otra vez.'
        : 'No se pudo completar la operación.');

    if (response.status === 401 && !skipAuthEvent && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT));
    }

    throw new ApiError(message, response.status, payload.code, data);
  }

  return data as T;
}

/**
 * Devuelve datos mock cuando el endpoint no existe todavía o no hay backend.
 * Cualquier otro error (validación, permisos…) se propaga tal cual.
 */
async function withMock<T>(label: string, mockValue: T, run: () => Promise<T>): Promise<T> {
  if (FORCE_MOCKS) {
    mockWarn(label, 'VITE_USE_MOCKS=true');
    return mockValue;
  }
  try {
    return await run();
  } catch (err) {
    const apiError = err as ApiError;
    const missing =
      apiError instanceof ApiError &&
      (apiError.isNetwork || apiError.status === 404 || apiError.status === 501);
    if (!missing) throw err;
    mockWarn(label, `Nexus respondió ${apiError.status || 'sin conexión'}`);
    return mockValue;
  }
}

/* ------------------------------------------------------------------ */
/* Auth — pasa por la función de sesión, que fija/limpia la cookie     */
/* ------------------------------------------------------------------ */

export const auth = {
  /** POST /api/auth/login → cookie httpOnly + usuario */
  login(input: LoginInput, signal?: AbortSignal): Promise<Session> {
    if (FORCE_MOCKS) {
      mockWarn('POST /auth/login', 'VITE_USE_MOCKS=true');
      return Promise.resolve({ user: { ...mockUser, email: input.email } });
    }
    return request<Session>('/auth/login', {
      method: 'POST',
      body: input,
      signal,
      skipAuthEvent: true,
    });
  },

  /** POST /api/auth/register → crea cuenta y abre sesión */
  register(input: RegisterInput, signal?: AbortSignal): Promise<Session> {
    if (FORCE_MOCKS) {
      mockWarn('POST /auth/register', 'VITE_USE_MOCKS=true');
      return Promise.resolve({
        user: { ...mockUser, email: input.email, fullName: input.fullName },
      });
    }
    return request<Session>('/auth/register', {
      method: 'POST',
      body: input,
      signal,
      skipAuthEvent: true,
    });
  },

  /** GET /api/auth/me → usuario de la sesión vigente */
  me(signal?: AbortSignal): Promise<Session> {
    if (FORCE_MOCKS) {
      mockWarn('GET /auth/me', 'VITE_USE_MOCKS=true');
      return Promise.resolve({ user: mockUser });
    }
    return request<Session>('/auth/me', { signal, skipAuthEvent: true });
  },

  /** POST /api/auth/logout → borra la cookie */
  logout(): Promise<void> {
    if (FORCE_MOCKS) return Promise.resolve();
    return request<void>('/auth/logout', { method: 'POST', skipAuthEvent: true });
  },

  /** POST /api/auth/forgot-password → envía correo de recuperación */
  requestPasswordReset(email: string, signal?: AbortSignal): Promise<{ sent: boolean }> {
    return request<{ sent: boolean }>('/auth/forgot-password', {
      method: 'POST',
      body: { email },
      signal,
      skipAuthEvent: true,
    });
  },

  /** POST /api/auth/reset-password → fija la nueva contraseña */
  resetPassword(input: ResetPasswordInput, signal?: AbortSignal): Promise<{ ok: boolean }> {
    return request<{ ok: boolean }>('/auth/reset-password', {
      method: 'POST',
      body: input,
      signal,
      skipAuthEvent: true,
    });
  },
};

/* ------------------------------------------------------------------ */
/* Cuenta y uso del plan                                               */
/* ------------------------------------------------------------------ */

export const account = {
  /** GET /usage → consumo del periodo actual */
  usage(signal?: AbortSignal): Promise<PlanUsage> {
    return withMock('GET /usage', mockPlanUsage, () =>
      request<PlanUsage>('/usage', { signal }),
    );
  },

  /** GET /me → perfil del cliente autenticado */
  profile(signal?: AbortSignal): Promise<AuthUser> {
    return request<AuthUser>('/me', { signal });
  },
};

/* ------------------------------------------------------------------ */
/* Proyectos                                                           */
/* ------------------------------------------------------------------ */

export const projects = {
  /** GET /projects */
  list(signal?: AbortSignal): Promise<Paginated<Project>> {
    return withMock('GET /projects', mockPaginated(mockProjects), () =>
      request<Paginated<Project>>('/projects', { signal }),
    );
  },

  /** GET /projects/:id */
  get(id: string, signal?: AbortSignal): Promise<Project> {
    const fallback = mockProjects.find((p) => p.id === id) ?? mockProjects[0];
    return withMock(`GET /projects/${id}`, fallback, () =>
      request<Project>(`/projects/${id}`, { signal }),
    );
  },

  /** POST /projects */
  create(input: ProjectInput, signal?: AbortSignal): Promise<Project> {
    return request<Project>('/projects', { method: 'POST', body: input, signal });
  },

  /** PATCH /projects/:id */
  update(id: string, input: Partial<ProjectInput>, signal?: AbortSignal): Promise<Project> {
    return request<Project>(`/projects/${id}`, { method: 'PATCH', body: input, signal });
  },

  /** DELETE /projects/:id */
  remove(id: string, signal?: AbortSignal): Promise<void> {
    return request<void>(`/projects/${id}`, { method: 'DELETE', signal });
  },
};

/* ------------------------------------------------------------------ */
/* Generación (asíncrona) e historial                                  */
/* ------------------------------------------------------------------ */

export const jobs = {
  /** POST /jobs → crea el trabajo y devuelve el id para hacer polling */
  create(input: GenerateInput, signal?: AbortSignal): Promise<Job> {
    return request<Job>('/jobs', { method: 'POST', body: input, signal });
  },

  /** GET /jobs?projectId&status&page */
  list(
    params: { projectId?: string; status?: JobStatus; page?: number; pageSize?: number } = {},
    signal?: AbortSignal,
  ): Promise<Paginated<Job>> {
    return withMock('GET /jobs', mockPaginated(mockJobs), () =>
      request<Paginated<Job>>('/jobs', { query: params, signal }),
    );
  },

  /** GET /jobs/:id → estado actual (usado por el polling) */
  get(id: string, signal?: AbortSignal): Promise<Job> {
    return request<Job>(`/jobs/${id}`, { signal });
  },

  /** POST /jobs/:id/retry */
  retry(id: string, signal?: AbortSignal): Promise<Job> {
    return request<Job>(`/jobs/${id}/retry`, { method: 'POST', signal });
  },

  /** POST /jobs/:id/publish → publica un trabajo ya generado */
  publish(id: string, signal?: AbortSignal): Promise<Job> {
    return request<Job>(`/jobs/${id}/publish`, { method: 'POST', signal });
  },

  /** GET /jobs/:id/preview → HTML de vista previa */
  preview(id: string, signal?: AbortSignal): Promise<{ html: string; title?: string }> {
    return request<{ html: string; title?: string }>(`/jobs/${id}/preview`, { signal });
  },
};

/* ------------------------------------------------------------------ */
/* Conexiones (WordPress)                                              */
/* ------------------------------------------------------------------ */

export const connections = {
  /** GET /connections */
  list(signal?: AbortSignal): Promise<Paginated<Connection>> {
    return withMock('GET /connections', mockPaginated(mockConnections), () =>
      request<Paginated<Connection>>('/connections', { signal }),
    );
  },

  /**
   * POST /connections — la application password viaja solo de ida.
   * Nexus la cifra y nunca la devuelve.
   */
  create(input: ConnectionInput, signal?: AbortSignal): Promise<Connection> {
    return request<Connection>('/connections', { method: 'POST', body: input, signal });
  },

  /** PATCH /connections/:id — omitir applicationPassword la deja intacta */
  update(
    id: string,
    input: Partial<ConnectionInput>,
    signal?: AbortSignal,
  ): Promise<Connection> {
    return request<Connection>(`/connections/${id}`, { method: 'PATCH', body: input, signal });
  },

  /** DELETE /connections/:id */
  remove(id: string, signal?: AbortSignal): Promise<void> {
    return request<void>(`/connections/${id}`, { method: 'DELETE', signal });
  },

  /** POST /connections/:id/test — prueba la conexión guardada */
  test(id: string, signal?: AbortSignal): Promise<ConnectionTestResult> {
    return withMock(`POST /connections/${id}/test`, mockConnectionTest, () =>
      request<ConnectionTestResult>(`/connections/${id}/test`, { method: 'POST', signal }),
    );
  },

  /** POST /connections/test — prueba credenciales antes de guardarlas */
  testDraft(input: ConnectionInput, signal?: AbortSignal): Promise<ConnectionTestResult> {
    return withMock('POST /connections/test', mockConnectionTest, () =>
      request<ConnectionTestResult>('/connections/test', { method: 'POST', body: input, signal }),
    );
  },
};

/* ------------------------------------------------------------------ */
/* Facturación — TODO Nexus: endpoint pendiente, hoy siempre mock      */
/* ------------------------------------------------------------------ */

export const billing = {
  /** GET /billing (pendiente en Nexus) */
  summary(signal?: AbortSignal): Promise<BillingSummary> {
    if (MOCK_ONLY.billing) {
      mockWarn('GET /billing', 'endpoint pendiente en Nexus');
      return Promise.resolve(mockBilling);
    }
    return request<BillingSummary>('/billing', { signal });
  },
};

export const api = { auth, account, projects, jobs, connections, billing };

export default api;
