import { useState } from 'react';
import { useTables } from '../../hooks/useTables.js';
import { api } from '../../api/apiClient.js';
import { formatPrice } from '../../lib/pricing.js';
import { TableScroll } from '../../components/TableScroll.jsx';
import { IconButton } from '../../components/IconButton.jsx';
import { RefreshIcon, CashIcon, CloseIcon } from '../../components/icons.jsx';

export function TablesTab() {
  const { tables, loading, error, refetch } = useTables();
  const [busyOrderId, setBusyOrderId] = useState(null);
  const [actionError, setActionError] = useState(null);

  async function handleClose(orderId, status) {
    if (status === 'cancelled' && !window.confirm('Cancel this table\'s order without marking it paid?')) {
      return;
    }
    setBusyOrderId(orderId);
    setActionError(null);
    try {
      await api.closeOrder(orderId, status);
      await refetch();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusyOrderId(null);
    }
  }

  const openTables = tables.filter((t) => t.open_order_id);
  const freeTables = tables.filter((t) => !t.open_order_id);

  return (
    <div className="manager-tab tables-tab">
      <div className="page-header">
        <h2>Open tables ({openTables.length})</h2>
        <IconButton icon={RefreshIcon} label="Refresh" className="icon-button-outline" onClick={refetch} />
      </div>
      {loading ? <p>Loading…</p> : null}
      {error ? <p className="error">{error}</p> : null}
      {actionError ? <p className="error">{actionError}</p> : null}

      <TableScroll>
        <table className="manager-table">
          <tbody>
            <tr>
              <th>Table</th>
              <th>Client</th>
              <th>Total</th>
              <th>In progress</th>
              <th></th>
            </tr>
            {openTables.map((t) => (
              <tr key={t.table_id}>
                <td>{t.label}</td>
                <td>{t.client_name || '-'}</td>
                <td>{formatPrice(t.running_total)}</td>
                <td>{(t.pending_count ?? 0) + (t.preparing_count ?? 0)}</td>
                <td>
                  <div className="icon-button-group">
                    <IconButton
                      icon={CashIcon}
                      label="Mark Paid & Close"
                      className="icon-button-success"
                      disabled={busyOrderId === t.open_order_id}
                      onClick={() => handleClose(t.open_order_id, 'paid')}
                    />
                    <IconButton
                      icon={CloseIcon}
                      label="Cancel order"
                      className="icon-button-danger"
                      disabled={busyOrderId === t.open_order_id}
                      onClick={() => handleClose(t.open_order_id, 'cancelled')}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableScroll>

      <h3>Free tables ({freeTables.length})</h3>
      <p className="free-tables-list">{freeTables.map((t) => t.label).join(', ') || 'None'}</p>
    </div>
  );
}
