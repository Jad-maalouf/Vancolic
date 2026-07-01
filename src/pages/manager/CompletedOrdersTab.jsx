import { Fragment, useState } from 'react';
import { useClosedOrders } from '../../hooks/useClosedOrders.js';
import { useOrderItems } from '../../hooks/useOrderItems.js';
import { formatPrice } from '../../lib/pricing.js';
import { TableScroll } from '../../components/TableScroll.jsx';
import { IconButton } from '../../components/IconButton.jsx';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import { OrderItemRow } from '../../components/OrderItemRow.jsx';
import { RefreshIcon } from '../../components/icons.jsx';

function today() {
  return new Date().toISOString().slice(0, 10);
}

function CompletedOrderItems({ orderId }) {
  const { items, loading } = useOrderItems(orderId);

  if (loading) return <p>Loading items…</p>;
  if (items.length === 0) return <p>No items on this order.</p>;

  return (
    <TableScroll>
      <table className="order-items-table">
        <tbody>
          <tr>
            <th className="item">Item</th>
            <th className="price">Qty</th>
            <th className="price">Total</th>
            <th className="price">Status</th>
          </tr>
          {items.map((item) => (
            <OrderItemRow key={item.id} item={item} />
          ))}
        </tbody>
      </table>
    </TableScroll>
  );
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
                <tr className="completed-order-row" onClick={() => toggleExpanded(o.id)}>
                  <td>{o.table_label}</td>
                  <td>{o.client_name || '-'}</td>
                  <td>{formatPrice(o.total)}</td>
                  <td><StatusBadge status={o.status} /></td>
                  <td>{new Date(o.closed_at).toLocaleString()}</td>
                </tr>
                {expandedId === o.id ? (
                  <tr>
                    <td colSpan={5}>
                      <CompletedOrderItems orderId={o.id} />
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
