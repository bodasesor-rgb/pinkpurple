import { Link } from 'react-router-dom';
import { account, billing as billingApi } from '../../api/client';
import { ErrorState, SkeletonRows } from '../../components/states/States';
import { useAsync } from '../../hooks/useAsync';
import { UsageMeter, formatDate } from '../shared/ui';

export default function BillingPage() {
  const usage = useAsync((signal) => account.usage(signal), []);
  const summary = useAsync((signal) => billingApi.summary(signal), []);

  return (
    <>
      <div className="pp-page-head">
        <div>
          <h1>Plan y facturación</h1>
          <p>Consumo del periodo y datos de tu suscripción.</p>
        </div>
      </div>

      <p className="pp-alert pp-alert--info">
        La facturación todavía no está conectada: los importes y las facturas que ves son de
        ejemplo. Para cambiar de plan, escríbenos y lo ajustamos a mano.
      </p>

      <section className="pp-card">
        <h2 className="pp-card__title">Tu plan</h2>

        {summary.loading ? <SkeletonRows rows={2} /> : null}

        {!summary.loading && summary.error ? (
          <ErrorState description={summary.error} onRetry={summary.reload} />
        ) : null}

        {!summary.loading && summary.data ? (
          <>
            <p className="pp-item__title" style={{ fontSize: '1.3rem' }}>
              {summary.data.planName}
            </p>
            <p className="pp-item__meta">
              ${summary.data.amount} {summary.data.currency} ·{' '}
              {summary.data.billing === 'annual' ? 'anual' : 'mensual'} · renueva el{' '}
              {formatDate(summary.data.renewsAt)}
            </p>
            <p className="pp-item__meta">
              Método de pago: {summary.data.paymentMethod ?? 'sin método registrado'}
            </p>
            <div className="pp-item__actions" style={{ marginTop: '0.75rem' }}>
              <Link className="pp-btn pp-btn--ghost pp-btn--sm" to="/productos/seo">
                Ver planes
              </Link>
            </div>
          </>
        ) : null}
      </section>

      <section className="pp-card" style={{ marginTop: '1rem' }}>
        <h2 className="pp-card__title">Consumo del periodo</h2>

        {usage.loading ? <SkeletonRows rows={3} /> : null}

        {!usage.loading && usage.error ? (
          <ErrorState description={usage.error} onRetry={usage.reload} />
        ) : null}

        {!usage.loading && usage.data ? (
          <div className="pp-usage">
            <UsageMeter label="Landings" counter={usage.data.landings} />
            <UsageMeter label="Blogs" counter={usage.data.blogs} />
            <UsageMeter label="Sitios conectados" counter={usage.data.sites} />
          </div>
        ) : null}
      </section>

      <section className="pp-card" style={{ marginTop: '1rem' }}>
        <h2 className="pp-card__title">Facturas</h2>
        {summary.data && summary.data.invoices.length > 0 ? (
          <ul className="pp-list">
            {summary.data.invoices.map((invoice) => (
              <li className="pp-item" key={invoice.id}>
                <div className="pp-item__head">
                  <p className="pp-item__title">{invoice.number}</p>
                  <span className="pp-badge pp-badge--published">{invoice.status}</span>
                </div>
                <p className="pp-item__meta">
                  ${invoice.amount} {invoice.currency} · {formatDate(invoice.issuedAt)}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="pp-item__meta">Todavía no hay facturas emitidas.</p>
        )}
      </section>
    </>
  );
}
