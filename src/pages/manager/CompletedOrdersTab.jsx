import { Fragment, useState } from 'react';
import { useClosedOrders } from '../../hooks/useClosedOrders.js';
import { formatPrice } from '../../lib/pricing.js';
import { TableScroll } from '../../components/TableScroll.jsx';
import { IconButton } from '../../components/IconButton.jsx';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import { OrderItemsDetail } from '../../components/OrderItemsDetail.jsx';
import { RefreshIcon } from '../../components/icons.jsx';

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function CompletedOrdersTab() {
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [expandedId, setExpandedId] = useState(null);
  const { orders, loading, error, refetch } = useClosedOrders(startDate, endDate);

  function toggleExpanded(orderId) {
    setExpandedId((current) => (current === orderId ? null : orderId));
  }

  return (
    <div className="manager-tab completed-orders-tab">
      <div className="page-header">
        <h2>Completed orders ({orders.length})</h2>
        <IconButton icon={RefreshIcon} label="Refresh" className="icon-button-outline" onClick={refetch} />
      </div>

      <div className="form-actions">
        <label>
          From
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </label>
        <label>
          To
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </label>
      </div>

      {loading ? <p>Loading…</p> : null}
      {error ? <p className="error">{error}</p> : null}

      <TableScroll>
        <table className="manager-table">
          <tbody>
            <tr>
              <th>Table</th>
              <th>Client</th>
              <th>Total</th>
              <th>Status</th>
              <th>Closed at</th>
            </tr>
            {orders.map((o) => (
              <Fragment key={o.id}>
                <tr className="expandable-row" onClick={() => toggleExpanded(o.id)}>
                  <td>{o.table_label}</td>
                  <td>{o.client_name || '-'}</td>
                  <td>{formatPrice(o.total)}</td>
                  <td><StatusBadge status={o.status} /></td>
                  <td>{new Date(o.closed_at).toLocaleString()}</td>
                </tr>
                {expandedId === o.id ? (
                  <tr>
                    <td colSpan={5}>
                      <OrderItemsDetail orderId={o.id} />
                    </td>
                  </tr>
                ) : null}
              </Fragment>
            ))}
          </tbody>
        </table>
      </TableScroll>
    </div>
  );
}
