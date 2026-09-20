import type { ReactNode } from 'react';

export function Spinner({ label = 'Cargando' }: { label?: string }) {
  return <span className="pp-spinner" role="status" aria-label={label} />;
}

export function LoadingState({ label = 'Cargando…' }: { label?: string }) {
  return (
    <div className="pp-state" role="status">
      <Spinner />
      <p>{label}</p>
    </div>
  );
}

export function SkeletonRows({ rows = 3 }: { rows?: number }) {
  return (
    <div className="pp-skeleton-list" aria-hidden="true">
      {Array.from({ length: rows }, (_, i) => (
        <div className="pp-skeleton" key={i} />
      ))}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon = '✨',
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: string;
}) {
  return (
    <div className="pp-state pp-state--empty">
      <span className="pp-state__icon" aria-hidden="true">
        {icon}
      </span>
      <h3>{title}</h3>
      {description ? <p>{description}</p> : null}
      {action ? <div className="pp-state__action">{action}</div> : null}
    </div>
  );
}

export function ErrorState({
  title = 'Algo salió mal',
  description,
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="pp-state pp-state--error" role="alert">
      <span className="pp-state__icon" aria-hidden="true">
        ⚠️
      </span>
      <h3>{title}</h3>
      {description ? <p>{description}</p> : null}
      {onRetry ? (
        <div className="pp-state__action">
          <button type="button" className="pp-btn pp-btn--ghost" onClick={onRetry}>
            Reintentar
          </button>
        </div>
      ) : null}
    </div>
  );
}
