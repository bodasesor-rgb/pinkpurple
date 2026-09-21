import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { account, billing as billingApi } from '../../api/client';
import { ErrorState, SkeletonRows } from '../../components/states/States';
import { useAsync } from '../../hooks/useAsync';
import { useAuth } from '../../auth/AuthContext';
import { loadDemoConfig, updateDemoConfig } from '../../auth/demoSession';
import { PLANS, getPlanById } from '../../data/plans.js';
import { UsageMeter, formatDate } from '../shared/ui';
import { TOKEN_PACKS, tokenPackRows, TOKENS_PER_DOLLAR, TOKEN_PACK_MIN_USD } from './tokenPacks';

export default function BillingPage() {
  const { isDemo } = useAuth();
  const usage = useAsync((signal) => account.usage(signal), []);
  const summary = useAsync((signal) => billingApi.summary(signal), []);
  const [demo, setDemo] = useState(() => loadDemoConfig());
  const [selectedTokens, setSelectedTokens] = useState<(typeof TOKEN_PACKS)[number]>(50);
  const [note, setNote] = useState('');
  const rows = useMemo(() => tokenPackRows(), []);
  const selectedRow = rows.find((r) => r.tokens === selectedTokens) || rows[2];
  const currentPlan = getPlanById(demo?.planId || summary.data?.planId || 'starter');
  const cancelled = demo?.planStatus === 'cancelled';

  function refreshDemo() {
    setDemo(loadDemoConfig());
  }

  function onChangePlan(planId: string) {
    if (!isDemo) {
      setNote('En cuenta real el cambio de plan se conectará al checkout. Por ahora usa el simulador.');
      return;
    }
    updateDemoConfig({ planId, planStatus: 'active' });
    refreshDemo();
    setNote(`Plan actualizado a ${getPlanById(planId).name}.`);
    usage.reload();
  }

  function onCancelPlan() {
    if (!window.confirm('¿Cancelar el plan? Seguirás viendo el panel hasta el fin del periodo simulado.')) {
      return;
    }
    if (!isDemo) {
      setNote('Cancelación real pendiente de pasarela de pago.');
      return;
    }
    updateDemoConfig({ planStatus: 'cancelled' });
    refreshDemo();
    setNote('Plan marcado como cancelado en esta sesión de prueba.');
  }

  function onBuyTokens() {
    if (!isDemo) {
      setNote('Compra de tokens real pendiente de pasarela. En el simulador sí se acreditan.');
      return;
    }
    const next = (demo?.extraTokens || 0) + selectedRow.tokens;
    updateDemoConfig({ extraTokens: next });
    refreshDemo();
    setNote(
      `Compraste ${selectedRow.tokens} tokens por $${selectedRow.price} USD. Saldo extra: ${next} tokens.`,
    );
  }

  return (
    <>
      <div className="pp-page-head">
        <div>
          <h1>Plan y facturación</h1>
          <p>Consumo, cambio de plan, cancelación y tokens extra.</p>
        </div>
        <Link className="pp-btn pp-btn--ghost" to="/app/configuracion">
          Volver
        </Link>
      </div>

      {note ? <p className="pp-alert pp-alert--info">{note}</p> : null}

      <section className="pp-card">
        <h2 className="pp-card__title">Tu plan</h2>
        {summary.loading && !demo ? <SkeletonRows rows={2} /> : null}
        {!summary.loading && summary.error && !demo ? (
          <ErrorState description={summary.error} onRetry={summary.reload} />
        ) : null}

        <p className="pp-item__title" style={{ fontSize: '1.3rem' }}>
          {currentPlan.name}
          {cancelled ? ' · cancelado' : ''}
        </p>
        <p className="pp-item__meta">
          {currentPlan.price === 0
            ? 'Prueba'
            : `$${currentPlan.price} USD / mes`}{' '}
          · {currentPlan.landings} landings · {currentPlan.blogs} blogs
          {demo?.extraTokens ? ` · +${demo.extraTokens} tokens extra` : ''}
        </p>

        <div className="pp-item__actions" style={{ marginTop: '0.85rem' }}>
          <button
            type="button"
            className="pp-btn pp-btn--danger pp-btn--sm"
            onClick={onCancelPlan}
            disabled={cancelled}
          >
            {cancelled ? 'Plan cancelado' : 'Cancelar plan'}
          </button>
        </div>
      </section>

      <section className="pp-card" style={{ marginTop: '1rem' }}>
        <h2 className="pp-card__title">Cambiar o subir de plan</h2>
        <p className="pp-item__meta" style={{ marginBottom: '0.85rem' }}>
          Elige otro plan. En producción abrirá el checkout; aquí se aplica en la sesión.
        </p>
        <div className="pp-plan-pick">
          {PLANS.filter((p) => p.id !== 'free').map((p) => (
            <button
              key={p.id}
              type="button"
              className={`pp-plan-pick__item${currentPlan.id === p.id ? ' is-on' : ''}`}
              onClick={() => onChangePlan(p.id)}
            >
              <strong>{p.name}</strong>
              <span>${p.price}/mes</span>
              <small>
                {p.landings} landings · {p.blogs} blogs
              </small>
            </button>
          ))}
        </div>
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
        <h2 className="pp-card__title">Comprar tokens extra</h2>
        <p className="pp-item__meta" style={{ marginBottom: '0.85rem' }}>
          {TOKENS_PER_DOLLAR} tokens = 1 USD. Precio redondeado. Mínimo de compra{' '}
          <strong>${TOKEN_PACK_MIN_USD}</strong>. Descuento mayor a más volumen.
        </p>

        <div className="pp-token-table-wrap">
          <table className="pp-token-table">
            <thead>
              <tr>
                <th scope="col">Tokens</th>
                <th scope="col">Lista</th>
                <th scope="col">Desc.</th>
                <th scope="col">Pagas</th>
                <th scope="col">Elegir</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.tokens} className={selectedTokens === row.tokens ? 'is-on' : ''}>
                  <td>
                    <strong>{row.tokens}</strong>
                  </td>
                  <td>${row.listPrice}</td>
                  <td>{row.discountLabel}</td>
                  <td>
                    <strong>${row.price}</strong>
                  </td>
                  <td>
                    <button
                      type="button"
                      className={`pp-btn pp-btn--sm${
                        selectedTokens === row.tokens ? ' pp-btn--primary' : ' pp-btn--ghost'
                      }`}
                      onClick={() => setSelectedTokens(row.tokens)}
                    >
                      {selectedTokens === row.tokens ? 'Seleccionado' : 'Elegir'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pp-item__actions" style={{ marginTop: '1rem', alignItems: 'center' }}>
          <p className="pp-item__meta" style={{ margin: 0 }}>
            Paquete: <strong>{selectedRow.tokens} tokens</strong> por{' '}
            <strong>${selectedRow.price} USD</strong>
            {selectedRow.savings > 0 ? ` (ahorras $${selectedRow.savings})` : ''}
          </p>
          <button type="button" className="pp-btn pp-btn--primary" onClick={onBuyTokens}>
            Comprar tokens
          </button>
        </div>
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
