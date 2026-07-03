import { formatPrice } from '../lib/pricing.js';
import { StatusBadge } from './StatusBadge.jsx';

const TWO_PRICE_CATEGORIES = new Set(['spirits', 'wine_bubbles']);

export function OrderItemRow({ item }) {
  const showPriceType = TWO_PRICE_CATEGORIES.has(item.category);
  return (
    <tr>
      <td className="item">
        {item.item_name}
        {showPriceType ? ` (${item.price_type === 'bottle' ? 'Bottle' : 'Glass'})` : ''}
        {item.notes ? (
          <>
            <br />
            <span className="order-item-note">{item.notes}</span>
          </>
        ) : null}
      </td>
      <td className="price">{item.quantity}</td>
      <td className="price">{formatPrice(item.unit_price * item.quantity)}</td>
      <td className="price">
        <StatusBadge status={item.status} />
      </td>
    </tr>
  );
}
