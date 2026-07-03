import { useState } from 'react';
import { TopNav } from '../components/TopNav.jsx';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { IconButton } from '../components/IconButton.jsx';
import { RefreshIcon, DoubleCheckIcon, PlayIcon, CheckIcon } from '../components/icons.jsx';
import { useActiveOrderItems } from '../hooks/useOrderItems.js';
import { api } from '../api/apiClient.js';

const NEXT_STATUS = { pending: 'preparing', preparing: 'served' };
const NEXT_LABEL = { pending: 'Start preparing', preparing: 'Mark served' };
const NEXT_ICON = { pending: PlayIcon, preparing: CheckIcon };

export default function BartenderBoard() {
  const { items, loading, error, refetch } = useActiveOrderItems();
  const [updatingId, setUpdatingId] = useState(null);
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const [actionError, setActionError] = useState(null);

  async function advance(item) {
    const next = NEXT_STATUS[item.status];
    if (!next) return;
    setUpdatingId(item.id);
    setActionError(null);
    try {
      await api.updateOrderItemStatus(item.id, next);
      await refetch();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setUpdatingId(null);
    }
  }

  async function markAllServed() {
    if (items.length === 0) return;
    if (!window.confirm(`Mark all ${items.length} item(s) below as served?`)) return;
    setBulkUpdating(true);
    setActionError(null);
    try {
      await Promise.all(items.map((item) => api.updateOrderItemStatus(item.id, 'served')));
      await refetch();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBulkUpdating(false);
    }
  }

  return (
    <div className="page bartender-board">
      <TopNav />
      <div className="page-header">
        <h1>Incoming orders</h1>
        <div className="icon-button-group">
          <IconButton icon={RefreshIcon} label="Refresh" className="icon-button-outline" onClick={refetch} />
          <IconButton
            icon={DoubleCheckIcon}
            label={bulkUpdating ? 'Marking…' : 'Mark all served'}
            className="icon-button-success"
            disabled={bulkUpdating || items.length === 0}
            onClick={markAllServed}
          />
        </div>
      </div>

      {loading ? <p>Loading…</p> : null}
      {error ? <p className="error">{error}</p> : null}
      {actionError ? <p className="error">{actionError}</p> : null}

      {!loading && items.length === 0 ? <p>No pending items — you're caught up.</p> : null}

      <div className="order-item-cards">
        {items.map((item) => (
          <div key={item.id} className={`order-item-card status-${item.status}`}>
            <div className="order-item-card-table">
              {item.table_label}
              {item.client_name ? ` — ${item.client_name}` : ''}
            </div>
            <div className="order-item-card-name">
              {item.quantity} × {item.item_name}
              <span className="order-item-card-type">
                {' '}
                ({item.price_type === 'bottle' ? 'Bottle' : 'Glass'})
              </span>
              {item.notes ? <div className="order-item-card-note">Note: {item.notes}</div> : null}
            </div>
            <div className="order-item-card-footer">
              <StatusBadge status={item.status} />
              {NEXT_STATUS[item.status] ? (
                <IconButton
                  icon={NEXT_ICON[item.status]}
                  label={updatingId === item.id ? 'Updating…' : NEXT_LABEL[item.status]}
                  className="icon-button-neutral"
                  disabled={updatingId === item.id}
                  onClick={() => advance(item)}
                />
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
