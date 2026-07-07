import { formatPrice } from '../lib/pricing.js';
import { StatusBadge } from './StatusBadge.jsx';
import { IconButton } from './IconButton.jsx';
import { TrashIcon } from './icons.jsx';

const TWO_PRICE_CATEGORIES = new Set(['spirits', 'wine_bubbles']);

export function OrderItemRow({ item, onRemove, removing, showPrice = true }) {
  const showPriceType = TWO_PRICE_CATEGORIES.has(item.category);
  return (
    <tr>
      <td className="item">
        {item.item_name}
        {showPriceType ? ` (${item.price_type === 'bottle' ? 'Bottle' : 'Glass'})` : ''}
        {item.mixer_label ? ` + ${item.mixer_label}` : ''}
        {item.notes ? (
          <>
            <br />
            <span className="order-item-note">{item.notes}</span>
          </>
        ) : null}
      </td>
      <td className="price">{item.quantity}</td>
      {showPrice ? <td className="price">{formatPrice(item.unit_price * item.quantity)}</td> : null}
      <td className="price">
        <StatusBadge status={item.status} />
      </td>
      {onRemove ? (
        <td className="price">
          <IconButton
            icon={TrashIcon}
            label={removing ? 'Removing…' : 'Remove'}
            className="icon-button-danger icon-button-sm"
            disabled={removing}
            onClick={() => onRemove(item)}
          />
        </td>
      ) : null}
    </tr>
  );
}
