import type { AuthUser, Language, Project, ProjectInput } from '../api/types';

export const DEMO_SESSION_KEY = 'pp_studio_demo_session_v1';
export const DEMO_CONFIG_KEY = 'pp_studio_simulator_v1';
export const DEMO_USER_PREFIX = 'usr_sim_';
export const DEMO_PROJECT_PREFIX = 'prj_sim_';

export type DemoConfig = {
  fullName: string;
  email: string;
  company: string;
  password?: string;
  planId: string;
  brandName: string;
  tagline: string;
  tone: string;
  siteHomeUrl: string;
  whatsapp: string;
  contactEmail: string;
  phone: string;
  countryCode: string;
  stateRegion: string;
  address: string;
  servicesOffered: string;
  idealClient: string;
  targetKeywords: string;
  publishTarget: string;
  publishSlug: string;
  publishSiteUrl: string;
  publishApiKey?: string;
  netlifySiteId?: string;
  createdAt?: string;
};

export type DemoSession = {
  user: AuthUser;
  config: DemoConfig;
  /** Proyectos locales de la empresa de prueba (CRUD real en el panel). */
  projects: Project[];
};

export function isDemoUserId(id: string | undefined | null): boolean {
  return Boolean(id && id.startsWith(DEMO_USER_PREFIX));
}

function domainFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url.replace(/^https?:\/\//, '').split('/')[0] || 'sitio.local';
  }
}

function servicesFromConfig(config: DemoConfig): string[] {
  return config.servicesOffered
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 8);
}

export function projectFromConfig(config: DemoConfig, stamp = Date.now().toString(36)): Project {
  const now = config.createdAt || new Date().toISOString();
  return {
    id: `${DEMO_PROJECT_PREFIX}${stamp}`,
    name: config.brandName.trim() || config.company.trim() || 'Mi proyecto',
    domain: domainFromUrl(config.siteHomeUrl),
    city: config.stateRegion.trim() || '—',
    services: servicesFromConfig(config),
    language: 'es' as Language,
    createdAt: now,
    updatedAt: now,
    jobsCount: 0,
  };
}

export function loadDemoSession(): DemoSession | null {
  try {
    const raw = localStorage.getItem(DEMO_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DemoSession;
    if (!parsed?.user?.id || !isDemoUserId(parsed.user.id)) return null;
    const projects = Array.isArray(parsed.projects)
      ? parsed.projects
      : [projectFromConfig(parsed.config)];
    return { ...parsed, projects };
  } catch {
    return null;
  }
}

export function loadDemoConfig(): DemoConfig | null {
  return loadDemoSession()?.config ?? null;
}

export function saveDemoSession(session: DemoSession): void {
  localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(session));
  localStorage.setItem(DEMO_CONFIG_KEY, JSON.stringify(session.config));
  localStorage.setItem(
    `pp_studio_profile_v1:${session.user.id}`,
    JSON.stringify({
      fullName: session.config.fullName,
      company: session.config.company || session.config.brandName,
    }),
  );
}

/** Borra por completo la empresa de prueba de este navegador. */
export function clearDemoSession(): void {
  try {
    const existing = loadDemoSession();
    if (existing?.user?.id) {
      localStorage.removeItem(`pp_studio_profile_v1:${existing.user.id}`);
    }
  } catch {
    /* ignore */
  }
  localStorage.removeItem(DEMO_SESSION_KEY);
  localStorage.removeItem(DEMO_CONFIG_KEY);
}

export function buildDemoSession(config: DemoConfig): DemoSession {
  const stamp = Date.now().toString(36);
  const id = `${DEMO_USER_PREFIX}${stamp}`;
  const normalized: DemoConfig = {
    ...config,
    createdAt: config.createdAt || new Date().toISOString(),
  };
  return {
    user: {
      id,
      email: config.email.trim(),
      fullName: config.fullName.trim(),
      tenantId: `tnt_sim_${stamp}`,
      planId: config.planId || 'starter',
      createdAt: normalized.createdAt!,
    },
    config: normalized,
    projects: [projectFromConfig(normalized, stamp)],
  };
}

export function listDemoProjects(): Project[] {
  return loadDemoSession()?.projects ?? [];
}

export function getDemoProject(id: string): Project | undefined {
  return listDemoProjects().find((p) => p.id === id);
}

export function createDemoProject(input: ProjectInput): Project {
  const session = loadDemoSession();
  if (!session) throw new Error('No hay empresa de prueba activa.');
  const now = new Date().toISOString();
  const project: Project = {
    id: `${DEMO_PROJECT_PREFIX}${Date.now().toString(36)}`,
    name: input.name.trim(),
    domain: input.domain.trim(),
    city: input.city.trim(),
    services: [...input.services],
    language: input.language,
    createdAt: now,
    updatedAt: now,
    jobsCount: 0,
  };
  saveDemoSession({ ...session, projects: [project, ...session.projects] });
  return project;
}

export function updateDemoProject(id: string, input: Partial<ProjectInput>): Project {
  const session = loadDemoSession();
  if (!session) throw new Error('No hay empresa de prueba activa.');
  const idx = session.projects.findIndex((p) => p.id === id);
  if (idx < 0) throw new Error('Proyecto no encontrado.');
  const prev = session.projects[idx];
  const next: Project = {
    ...prev,
    name: input.name?.trim() ?? prev.name,
    domain: input.domain?.trim() ?? prev.domain,
    city: input.city?.trim() ?? prev.city,
    services: input.services ? [...input.services] : prev.services,
    language: input.language ?? prev.language,
    updatedAt: new Date().toISOString(),
  };
  const projects = [...session.projects];
  projects[idx] = next;
  saveDemoSession({ ...session, projects });
  return next;
}

/**
 * Borra un proyecto. Si era el último, borra toda la empresa de prueba.
 * @returns true si también se cerró la empresa (sesión demo limpia).
 */
export function removeDemoProject(id: string): { companyDeleted: boolean } {
  const session = loadDemoSession();
  if (!session) return { companyDeleted: true };
  const projects = session.projects.filter((p) => p.id !== id);
  if (projects.length === 0) {
    clearDemoSession();
    return { companyDeleted: true };
  }
  saveDemoSession({ ...session, projects });
  return { companyDeleted: false };
}
