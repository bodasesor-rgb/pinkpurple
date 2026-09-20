/**
 * Contrato de datos con Nexus (API del motor de generación).
 * Cambiar aquí = cambiar en todo el panel.
 */

export type Tone = 'profesional' | 'cercano' | 'directo' | 'inspirador' | 'tecnico';
export type ContentType = 'landing' | 'blog';
export type Language = 'es' | 'en' | 'pt';

/** Estados que puede devolver Nexus para un trabajo. */
export type JobStatus = 'queued' | 'generating' | 'ready' | 'published' | 'error';

export const ACTIVE_JOB_STATUSES: JobStatus[] = ['queued', 'generating'];

export function isJobFinished(status: JobStatus): boolean {
  return !ACTIVE_JOB_STATUSES.includes(status);
}

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  tenantId: string;
  planId: string;
  createdAt: string;
}

export interface Session {
  user: AuthUser;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  fullName: string;
  plan?: string;
  billing?: 'monthly' | 'annual';
}

export interface ResetPasswordInput {
  token: string;
  password: string;
}

/** Contador de consumo del plan en el periodo vigente. */
export interface UsageCounter {
  used: number;
  limit: number | null; // null = ilimitado
}

export interface PlanUsage {
  planId: string;
  planName: string;
  billing: 'monthly' | 'annual';
  periodStart: string;
  periodEnd: string;
  landings: UsageCounter;
  blogs: UsageCounter;
  sites: UsageCounter;
}

export interface Project {
  id: string;
  name: string;
  domain: string;
  city: string;
  services: string[];
  language: Language;
  createdAt: string;
  updatedAt: string;
  jobsCount?: number;
}

export interface ProjectInput {
  name: string;
  domain: string;
  city: string;
  services: string[];
  language: Language;
}

export interface Job {
  id: string;
  projectId: string;
  projectName?: string;
  type: ContentType;
  keyword: string;
  city: string;
  tone: Tone;
  status: JobStatus;
  /** 0–100 si Nexus lo reporta. */
  progress?: number;
  title?: string;
  previewUrl?: string;
  publishedUrl?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GenerateInput {
  projectId: string;
  type: ContentType;
  keyword: string;
  city: string;
  tone: Tone;
  notes?: string;
  /** Publicar automáticamente al terminar si hay conexión activa. */
  autoPublish?: boolean;
}

export type ConnectionProvider = 'wordpress';
export type ConnectionStatus = 'unknown' | 'ok' | 'error';

/** Nunca incluye credenciales: Nexus solo devuelve metadatos. */
export interface Connection {
  id: string;
  projectId: string;
  provider: ConnectionProvider;
  siteUrl: string;
  username: string;
  status: ConnectionStatus;
  lastCheckedAt?: string;
  lastError?: string;
  createdAt: string;
}

export interface ConnectionInput {
  projectId: string;
  provider: ConnectionProvider;
  siteUrl: string;
  username: string;
  /** Application password de WordPress. Solo viaja hacia Nexus, nunca de vuelta. */
  applicationPassword: string;
}

export interface ConnectionTestResult {
  ok: boolean;
  message: string;
  checkedAt: string;
}

export interface Invoice {
  id: string;
  number: string;
  amount: number;
  currency: string;
  status: 'paid' | 'open' | 'void';
  issuedAt: string;
  pdfUrl?: string;
}

export interface BillingSummary {
  planId: string;
  planName: string;
  billing: 'monthly' | 'annual';
  amount: number;
  currency: string;
  renewsAt: string;
  paymentMethod: string | null;
  invoices: Invoice[];
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
