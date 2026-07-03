import { useState } from 'react';
import { TopNav } from '../components/TopNav.jsx';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { IconButton } from '../components/IconButton.jsx';
import { RefreshIcon, DoubleCheckIcon, PlayIcon, CheckIcon } from '../components/icons.jsx';
import { useActiveOrderItems } from '../hooks/useOrderItems.js';
import { api } from '../api/apiClient.js';

const NEXT_STATUS = { pending: 'preparing', preparing: 'served' };
const NEXT_LABEL = { pending: 'Preparing', preparing: 'Serving' };
const NEXT_ICON = { pending: PlayIcon, preparing: CheckIcon };

// Group active items by table, keeping the overall created_at order:
// groups appear in the order their first item came in, items keep order within.
function groupByTable(items) {
  const groups = new Map();
  for (const item of items) {
    const key = item.order_id;
    if (!groups.has(key)) {
      groups.set(key, { key, table_label: item.table_label, client_name: item.client_name, items: [] });
    }
    groups.get(key).items.push(item);
  }
  return [...groups.values()];
}

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

      <div className="table-order-groups">
        {groupByTable(items).map((group) => (
          <div key={group.key} className="table-order-group">
            <div className="table-order-group-header">
              {group.table_label}
              {group.client_name ? ` — ${group.client_name}` : ''}
            </div>
            <table className="table-order-items">
              <tbody>
                {group.items.map((item) => (
                  <tr key={item.id} className={`status-${item.status}`}>
                    <td className="table-order-item-name">
                      {item.quantity} × {item.item_name}
                      {item.mixer_label ? ` + ${item.mixer_label}` : ''}
                      <span className="order-item-card-type">
                        {' '}
                        ({item.price_type === 'bottle' ? 'Bottle' : 'Glass'})
                      </span>
                      {item.notes ? <div className="order-item-card-note">Note: {item.notes}</div> : null}
                    </td>
                    <td className="table-order-item-status">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="table-order-item-action">
                      {NEXT_STATUS[item.status] ? (
                        <IconButton
                          icon={NEXT_ICON[item.status]}
                          label={updatingId === item.id ? 'Updating…' : NEXT_LABEL[item.status]}
                          className="icon-button-neutral"
                          disabled={updatingId === item.id}
                          onClick={() => advance(item)}
                        />
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}
