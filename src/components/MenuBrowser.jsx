import { useState } from 'react';
import { CategoryTabs } from './CategoryTabs.jsx';
import { TableScroll } from './TableScroll.jsx';
import { formatPrice, formatPriceValue, groupMenuItems } from '../lib/pricing.js';

// Shared by the public menu (read-only) and the waiter's order builder
// (renderActions adds "add to order" controls per row).
export function MenuBrowser({ items, renderActions, defaultCategoryId }) {
  const grouped = groupMenuItems(items).filter((c) =>
    c.subcategories.some((s) => s.items.length > 0)
  );
  const [activeId, setActiveId] = useState(defaultCategoryId || grouped[0]?.id);
  const active = grouped.find((c) => c.id === activeId) || grouped[0];

  if (!active) return <p className="menu-empty">No menu items yet.</p>;

  return (
    <div className="menu">
      <CategoryTabs categories={grouped} activeId={active.id} onChange={setActiveId} />
      <div className="category" style={{ display: 'block' }}>
        {active.subcategories.map((sub) => {
          const hasBottle = sub.items.some((i) => i.bottle_price != null);
          const mixerItems = sub.items.filter((i) => i.mixer_price != null);
          const mixer = mixerItems[0];
          const mixerTarget =
            mixerItems.length === sub.items.length
              ? 'any glass'
              : mixerItems.map((i) => i.name).join(', ');
          return (
            <div key={sub.name}>
              <h2 className="sub_menu">{sub.name}</h2>
              <TableScroll>
                <table>
                  <tbody>
                    <tr>
                      <th className="item">Item</th>
                      {hasBottle ? (
                        <>
                          <th className="price">Bottle ($)</th>
                          <th className="price">Glass ($)</th>
                        </>
                      ) : (
                        <th className="price">Price ($)</th>
                      )}
                      {renderActions ? <th className="price">Add</th> : null}
                    </tr>
                    {sub.items.map((item) => (
                      <tr key={item.id}>
                        <td className="item">
                          {item.name}
                          {item.description ? (
                            <>
                              <br />
                              <i>({item.description})</i>
                            </>
                          ) : null}
                        </td>
                        {hasBottle ? (
                          <>
                            <td className="price">{formatPriceValue(item.bottle_price)}</td>
                            <td className="price">{formatPriceValue(item.glass_price)}</td>
                          </>
                        ) : (
                          <td className="price">{formatPriceValue(item.glass_price)}</td>
                        )}
                        {renderActions ? <td className="price">{renderActions(item)}</td> : null}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableScroll>
              {mixer ? (
                <p className="mixer-note">
                  * Add {mixer.mixer_label} to {mixerTarget} +{formatPrice(mixer.mixer_price)}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
