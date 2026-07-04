import { Fragment, useState } from 'react';
import { useTables } from '../../hooks/useTables.js';
import { api } from '../../api/apiClient.js';
import { formatPrice } from '../../lib/pricing.js';
import { TableScroll } from '../../components/TableScroll.jsx';
import { IconButton } from '../../components/IconButton.jsx';
import { OrderItemsDetail } from '../../components/OrderItemsDetail.jsx';
import { RefreshIcon, CashIcon, CloseIcon, CheckIcon, PencilIcon } from '../../components/icons.jsx';

export function TablesTab() {
  const { tables, loading, error, refetch } = useTables();
  const [busyOrderId, setBusyOrderId] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [editingTableId, setEditingTableId] = useState(null);
  const [labelDraft, setLabelDraft] = useState('');
  const [savingLabel, setSavingLabel] = useState(false);

  function toggleExpanded(orderId) {
    setExpandedOrderId((current) => (current === orderId ? null : orderId));
  }

  function startRename(table) {
    setEditingTableId(table.table_id);
    setLabelDraft(table.label);
    setActionError(null);
  }

  async function saveRename() {
    const label = labelDraft.trim();
    if (!label || savingLabel) return;
    setSavingLabel(true);
    setActionError(null);
    try {
      await api.renameTable(editingTableId, label);
      setEditingTableId(null);
      await refetch();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSavingLabel(false);
    }
  }

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
              <th>Persons</th>
              <th>Total</th>
              <th>In progress</th>
              <th></th>
            </tr>
            {openTables.map((t) => (
              <Fragment key={t.table_id}>
                <tr className="expandable-row" onClick={() => toggleExpanded(t.open_order_id)}>
                  <td>{t.label}</td>
                  <td>{t.client_name || '-'}</td>
                  <td>{t.persons_count || '-'}</td>
                  <td>{formatPrice(t.running_total)}</td>
                  <td>{(t.pending_count ?? 0) + (t.preparing_count ?? 0)}</td>
                  <td onClick={(e) => e.stopPropagation()}>
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
                {expandedOrderId === t.open_order_id ? (
                  <tr>
                    <td colSpan={6}>
                      <OrderItemsDetail orderId={t.open_order_id} />
                    </td>
                  </tr>
                ) : null}
              </Fragment>
            ))}
          </tbody>
        </table>
      </TableScroll>

      <h3>Free tables ({freeTables.length})</h3>
      <p className="free-tables-list">{freeTables.map((t) => t.label).join(', ') || 'None'}</p>

      <h3>Rename tables</h3>
      <div className="table-rename-list">
        {tables.map((t) =>
          editingTableId === t.table_id ? (
            <form
              key={t.table_id}
              className="table-rename-item"
              onSubmit={(e) => {
                e.preventDefault();
                saveRename();
              }}
            >
              <input
                value={labelDraft}
                onChange={(e) => setLabelDraft(e.target.value)}
                maxLength={40}
                autoFocus
              />
              <IconButton
                icon={CheckIcon}
                label={savingLabel ? 'Saving…' : 'Save name'}
                type="submit"
                className="icon-button-success icon-button-sm"
                disabled={savingLabel || !labelDraft.trim()}
              />
              <IconButton
                icon={CloseIcon}
                label="Cancel rename"
                className="icon-button-danger icon-button-sm"
                onClick={() => setEditingTableId(null)}
              />
            </form>
          ) : (
            <div key={t.table_id} className="table-rename-item">
              <span>{t.label}</span>
              <IconButton
                icon={PencilIcon}
                label={`Rename ${t.label}`}
                className="icon-button-neutral icon-button-sm"
                onClick={() => startRename(t)}
              />
            </div>
          )
        )}
      </div>
    </div>
  );
}
