import { useState } from 'react';
import { TopNav } from '../components/TopNav.jsx';
import { TableCard } from '../components/TableCard.jsx';
import { OrderItemRow } from '../components/OrderItemRow.jsx';
import { MenuBrowser } from '../components/MenuBrowser.jsx';
import { TableScroll } from '../components/TableScroll.jsx';
import { IconButton } from '../components/IconButton.jsx';
import { CheckIcon, CloseIcon, BackIcon, PlusIcon, BottleIcon, GlassIcon } from '../components/icons.jsx';
import { useTables } from '../hooks/useTables.js';
import { useMenuItems } from '../hooks/useMenuItems.js';
import { useOrderItems } from '../hooks/useOrderItems.js';
import { api } from '../api/apiClient.js';
import { computeOrderTotal, formatPrice } from '../lib/pricing.js';

function OpenTableForm({ table, onCancel, onOpened }) {
  const [clientName, setClientName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const { order } = await api.openTable(table.table_id, clientName.trim() || null);
      onOpened(order);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="open-table-form" onSubmit={handleSubmit}>
      <h2>Open {table.label}</h2>
      {error ? <p className="error">{error}</p> : null}
      <label>
        Client / party name (optional)
        <input
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          placeholder="e.g. John's group"
          autoFocus
        />
      </label>
      <div className="form-actions icon-button-group">
        <IconButton
          icon={CheckIcon}
          label={submitting ? 'Opening…' : 'Open table'}
          type="submit"
          className="icon-button-success"
          disabled={submitting}
        />
        <IconButton icon={CloseIcon} label="Cancel" className="icon-button-danger" onClick={onCancel} />
      </div>
    </form>
  );
}

function OrderBuilder({ table, orderId, onBack, onTablesChanged }) {
  const { items: orderItems, loading: itemsLoading, refetch: refetchItems } = useOrderItems(orderId);
  const { items: menuItems, loading: menuLoading } = useMenuItems();
  const [addingId, setAddingId] = useState(null);
  const [error, setError] = useState(null);

  async function handleAdd(menuItem, priceType) {
    setAddingId(`${menuItem.id}-${priceType}`);
    setError(null);
    try {
      await api.addOrderItem(orderId, { menuItemId: menuItem.id, priceType, quantity: 1 });
      await refetchItems();
      onTablesChanged();
    } catch (err) {
      setError(err.message);
    } finally {
      setAddingId(null);
    }
  }

  const total = computeOrderTotal(orderItems);

  return (
    <div className="order-builder">
      <IconButton icon={BackIcon} label="Back to tables" className="icon-button-outline" onClick={onBack} />
      <h2>
        {table.label}
        {table.client_name ? ` — ${table.client_name}` : ''}
      </h2>

      <section>
        <h3>Current order — {formatPrice(total)}</h3>
        {itemsLoading ? (
          <p>Loading order…</p>
        ) : orderItems.length === 0 ? (
          <p>No items yet — add from the menu below.</p>
        ) : (
          <TableScroll>
            <table className="order-items-table">
              <tbody>
                <tr>
                  <th className="item">Item</th>
                  <th className="price">Qty</th>
                  <th className="price">Total</th>
                  <th className="price">Status</th>
                </tr>
                {orderItems.map((item) => (
                  <OrderItemRow key={item.id} item={item} />
                ))}
              </tbody>
            </table>
          </TableScroll>
        )}
      </section>

      <section>
        <h3>Add items</h3>
        {error ? <p className="error">{error}</p> : null}
        {menuLoading ? (
          <p>Loading menu…</p>
        ) : (
          <MenuBrowser
            items={menuItems}
            renderActions={(item) => (
              <div className="add-actions">
                {item.bottle_price != null ? (
                  <IconButton
                    icon={BottleIcon}
                    label="Add bottle"
                    className="icon-button-neutral icon-button-sm"
                    disabled={addingId === `${item.id}-bottle`}
                    onClick={() => handleAdd(item, 'bottle')}
                  />
                ) : null}
                {item.glass_price != null ? (
                  <IconButton
                    icon={item.bottle_price != null ? GlassIcon : PlusIcon}
                    label={item.bottle_price != null ? 'Add glass' : 'Add'}
                    className="icon-button-neutral icon-button-sm"
                    disabled={addingId === `${item.id}-glass`}
                    onClick={() => handleAdd(item, 'glass')}
                  />
                ) : null}
              </div>
            )}
          />
        )}
      </section>
    </div>
  );
}

export default function WaiterView() {
  const { tables, loading, error, refetch } = useTables();
  const [pendingTable, setPendingTable] = useState(null);
  const [activeTable, setActiveTable] = useState(null);

  function handleSelect(table) {
    if (table.open_order_id) {
      setActiveTable(table);
    } else {
      setPendingTable(table);
    }
  }

  function handleOpened(order) {
    setPendingTable(null);
    refetch();
    setActiveTable({ ...pendingTable, open_order_id: order.id, client_name: order.client_name });
  }

  function handleBack() {
    setActiveTable(null);
    refetch();
  }

  return (
    <div className="page waiter-view">
      <TopNav />
      <h1>Tables</h1>

      {activeTable ? (
        <OrderBuilder
          table={activeTable}
          orderId={activeTable.open_order_id}
          onBack={handleBack}
          onTablesChanged={refetch}
        />
      ) : pendingTable ? (
        <OpenTableForm
          table={pendingTable}
          onCancel={() => setPendingTable(null)}
          onOpened={handleOpened}
        />
      ) : (
        <>
          {loading ? <p>Loading tables…</p> : null}
          {error ? <p className="error">{error}</p> : null}
          <div className="table-grid">
            {tables.map((table) => (
              <TableCard key={table.table_id} table={table} onSelect={handleSelect} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
