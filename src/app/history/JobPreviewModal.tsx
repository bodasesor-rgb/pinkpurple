import { useEffect } from 'react';
import { jobs as jobsApi } from '../../api/client';
import { ErrorState, LoadingState } from '../../components/states/States';
import { useAsync } from '../../hooks/useAsync';
import type { Job } from '../../api/types';

export default function JobPreviewModal({ job, onClose }: { job: Job; onClose: () => void }) {
  const { data, loading, error, reload } = useAsync(
    (signal) => jobsApi.preview(job.id, signal),
    [job.id],
  );

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="pp-modal" role="dialog" aria-modal="true" aria-label="Vista previa">
      <div className="pp-modal__panel">
        <div className="pp-modal__head">
          <div>
            <h2>{job.title || job.keyword}</h2>
            <p className="pp-item__meta">
              {job.type === 'landing' ? 'Landing' : 'Blog'} · {job.city || 'Sin ciudad'}
            </p>
          </div>
          <button type="button" className="pp-btn pp-btn--ghost pp-btn--sm" onClick={onClose}>
            Cerrar
          </button>
        </div>

        {loading ? <LoadingState label="Cargando vista previa…" /> : null}

        {!loading && error ? (
          <ErrorState
            title="No pudimos cargar la vista previa"
            description={error}
            onRetry={reload}
          />
        ) : null}

        {!loading && data ? (
          <div className="pp-preview">
            <iframe
              className="pp-preview__frame"
              title={`Vista previa de ${job.title || job.keyword}`}
              srcDoc={data.html}
              sandbox=""
            />
          </div>
        ) : null}

        {job.publishedUrl ? (
          <p style={{ marginTop: '0.85rem' }}>
            <a
              className="pp-link"
              href={job.publishedUrl}
              target="_blank"
              rel="noreferrer noopener"
            >
              Abrir la página publicada ↗
            </a>
          </p>
        ) : null}
      </div>
    </div>
  );
}
