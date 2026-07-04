import { formatPrice } from '../lib/pricing.js';

export function TableCard({ table, onSelect }) {
  const isOpen = Boolean(table.open_order_id);
  const inProgress = (table.pending_count ?? 0) + (table.preparing_count ?? 0);

  return (
    <button
      type="button"
      className={`table-card ${isOpen ? 'table-card-open' : 'table-card-free'}`}
      onClick={() => onSelect(table)}
    >
      <div className="table-card-label">{table.label}</div>
      {isOpen ? (
        <>
          <div className="table-card-client">
            {table.client_name || 'No name'}
            {table.persons_count ? ` · ${table.persons_count} persons` : ''}
          </div>
          <div className="table-card-total">{formatPrice(table.running_total)}</div>
          {inProgress > 0 ? <div className="table-card-pending">{inProgress} in progress</div> : null}
        </>
      ) : (
        <div className="table-card-free-label">Free</div>
      )}
    </button>
  );
}
