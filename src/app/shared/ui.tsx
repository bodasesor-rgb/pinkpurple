import type { ConnectionStatus, JobStatus, UsageCounter } from '../../api/types';

const JOB_LABELS: Record<JobStatus, string> = {
  queued: 'En cola',
  generating: 'Generando',
  ready: 'Listo',
  published: 'Publicado',
  error: 'Error',
};

export function JobStatusBadge({ status }: { status: JobStatus }) {
  return <span className={`pp-badge pp-badge--${status}`}>{JOB_LABELS[status]}</span>;
}

const CONNECTION_LABELS: Record<ConnectionStatus, string> = {
  ok: 'Conectado',
  error: 'Con error',
  unknown: 'Sin probar',
};

export function ConnectionStatusBadge({ status }: { status: ConnectionStatus }) {
  const variant = status === 'ok' ? 'ok' : status === 'error' ? 'error' : 'unknown';
  return <span className={`pp-badge pp-badge--${variant}`}>{CONNECTION_LABELS[status]}</span>;
}

export function UsageMeter({ label, counter }: { label: string; counter: UsageCounter }) {
  const unlimited = counter.limit === null;
  const pct = unlimited ? 0 : Math.min(100, Math.round((counter.used / Math.max(counter.limit || 1, 1)) * 100));
  const full = !unlimited && pct >= 90;

  return (
    <div className="pp-usage__item">
      <div className="pp-usage__head">
        <span className="pp-usage__label">{label}</span>
        <span className="pp-usage__value">
          {counter.used.toLocaleString('es-MX')}
          {unlimited ? ' · ilimitado' : ` / ${(counter.limit ?? 0).toLocaleString('es-MX')}`}
        </span>
      </div>
      {!unlimited ? (
        <div
          className="pp-bar"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={label}
        >
          <div className={`pp-bar__fill${full ? ' pp-bar__fill--full' : ''}`} style={{ width: `${pct}%` }} />
        </div>
      ) : null}
    </div>
  );
}

export function formatDate(value?: string): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateTime(value?: string): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('es-MX', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}
