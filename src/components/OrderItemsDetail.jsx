import { useOrderItems } from '../hooks/useOrderItems.js';
import { TableScroll } from './TableScroll.jsx';
import { OrderItemRow } from './OrderItemRow.jsx';

export function OrderItemsDetail({ orderId }) {
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
