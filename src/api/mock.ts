/**
 * ⚠️ DATOS MOCK — NO SON REALES.
 *
 * Se usan solo cuando:
 *  - el endpoint todavía no existe en Nexus (ver `MOCK_ONLY_ENDPOINTS` en client.ts), o
 *  - se arranca el panel con VITE_USE_MOCKS=true para trabajar sin backend.
 *
 * Cada respuesta mock deja un warning en consola con el endpoint pendiente.
 */
import type {
  AuthUser,
  BillingSummary,
  Connection,
  ConnectionTestResult,
  Job,
  Paginated,
  PlanUsage,
  Project,
} from './types';

const now = () => new Date().toISOString();
const daysFromNow = (days: number) =>
  new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

export function mockWarn(endpoint: string, reason: string): void {
  console.warn(`[MOCK] ${endpoint} — ${reason}. Los datos mostrados NO son reales.`);
}

/** Solo con VITE_USE_MOCKS=true: sesión falsa para recorrer el panel sin Nexus. */
export const mockUser: AuthUser = {
  id: 'usr_demo',
  email: 'demo@pinkpurple.seo',
  fullName: 'Cuenta Demo',
  tenantId: 'tnt_demo',
  planId: 'growth',
  createdAt: daysFromNow(-60),
};

export const mockPlanUsage: PlanUsage = {
  planId: 'growth',
  planName: 'Growth',
  billing: 'monthly',
  periodStart: daysFromNow(-12),
  periodEnd: daysFromNow(18),
  landings: { used: 84, limit: 400 },
  blogs: { used: 31, limit: 150 },
  sites: { used: 2, limit: 6 },
};

export const mockProjects: Project[] = [
  {
    id: 'prj_demo_1',
    name: 'Clínica Dental Centro',
    domain: 'clinicadentalcentro.mx',
    city: 'Ciudad de México',
    services: ['Implantes', 'Ortodoncia', 'Blanqueamiento'],
    language: 'es',
    createdAt: daysFromNow(-40),
    updatedAt: daysFromNow(-2),
    jobsCount: 18,
  },
  {
    id: 'prj_demo_2',
    name: 'Inmobiliaria Norte',
    domain: 'inmobiliarianorte.com',
    city: 'Monterrey',
    services: ['Venta de casas', 'Renta de oficinas'],
    language: 'es',
    createdAt: daysFromNow(-18),
    updatedAt: daysFromNow(-1),
    jobsCount: 7,
  },
];

export const mockJobs: Job[] = [
  {
    id: 'job_demo_1',
    projectId: 'prj_demo_1',
    projectName: 'Clínica Dental Centro',
    type: 'landing',
    keyword: 'implantes dentales',
    city: 'Ciudad de México',
    tone: 'profesional',
    status: 'published',
    title: 'Implantes dentales en Ciudad de México',
    publishedUrl: 'https://clinicadentalcentro.mx/implantes-dentales-cdmx',
    previewUrl: 'https://clinicadentalcentro.mx/implantes-dentales-cdmx',
    createdAt: daysFromNow(-3),
    updatedAt: daysFromNow(-3),
  },
  {
    id: 'job_demo_2',
    projectId: 'prj_demo_1',
    projectName: 'Clínica Dental Centro',
    type: 'blog',
    keyword: 'cuánto dura un implante dental',
    city: 'Ciudad de México',
    tone: 'cercano',
    status: 'generating',
    progress: 45,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'job_demo_3',
    projectId: 'prj_demo_2',
    projectName: 'Inmobiliaria Norte',
    type: 'landing',
    keyword: 'casas en venta san pedro',
    city: 'Monterrey',
    tone: 'directo',
    status: 'error',
    errorMessage: 'WordPress rechazó la publicación (401). Revisa la conexión del proyecto.',
    createdAt: daysFromNow(-1),
    updatedAt: daysFromNow(-1),
  },
];

export const mockConnections: Connection[] = [
  {
    id: 'con_demo_1',
    projectId: 'prj_demo_1',
    provider: 'wordpress',
    siteUrl: 'https://clinicadentalcentro.mx',
    username: 'editor_pp',
    status: 'ok',
    lastCheckedAt: daysFromNow(-1),
    createdAt: daysFromNow(-30),
  },
];

export const mockConnectionTest: ConnectionTestResult = {
  ok: true,
  message: 'Conexión correcta. WordPress respondió y el usuario puede publicar.',
  checkedAt: now(),
};

export const mockBilling: BillingSummary = {
  planId: 'growth',
  planName: 'Growth',
  billing: 'monthly',
  amount: 99,
  currency: 'USD',
  renewsAt: daysFromNow(18),
  paymentMethod: null,
  invoices: [],
};

export function mockPaginated<T>(items: T[]): Paginated<T> {
  return { items, total: items.length, page: 1, pageSize: items.length || 1 };
}
