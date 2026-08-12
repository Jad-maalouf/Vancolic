import { useState } from "react";
import { TopNav } from "../components/TopNav.jsx";
import { StatusBadge } from "../components/StatusBadge.jsx";
import { IconButton } from "../components/IconButton.jsx";
import {
  RefreshIcon,
  DoubleCheckIcon,
  CheckIcon,
} from "../components/icons.jsx";
import { useActiveOrderItems } from "../hooks/useOrderItems.js";
import { api } from "../api/apiClient.js";
import { groupIdenticalItems } from "../lib/pricing.js";
import { RecipesTab } from "./bartender/RecipesTab.jsx";

// Group active items by table, keeping the overall created_at order:
// groups appear in the order their first item came in, items keep order within.
function groupByTable(items) {
  const groups = new Map();
  for (const item of items) {
    const key = item.order_id;
    if (!groups.has(key)) {
      groups.set(key, {
        key,
        table_label: item.table_label,
        client_name: item.client_name,
        items: [],
      });
    }
    groups.get(key).items.push(item);
  }
  return [...groups.values()];
}

export default function BartenderBoard() {
  const [activeTab, setActiveTab] = useState("orders");

  return (
    <div className="page bartender-board">
      <TopNav />
      <h1>Bartender</h1>
      <div className="manager-tab-bar">
        <button
          type="button"
          className={activeTab === "orders" ? "selected" : ""}
          onClick={() => setActiveTab("orders")}
        >
          Orders
        </button>
        <button
          type="button"
          className={activeTab === "recipes" ? "selected" : ""}
          onClick={() => setActiveTab("recipes")}
        >
          Recipes
        </button>
      </div>
      {activeTab === "orders" ? <OrdersTab /> : <RecipesTab />}
    </div>
  );
}

function OrdersTab() {
  const { items, loading, error, refetch } = useActiveOrderItems();
  const [updatingId, setUpdatingId] = useState(null);
  const [servingTableKey, setServingTableKey] = useState(null);
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const [actionError, setActionError] = useState(null);

  // `line` may be several identical rows merged together — serve all of them.
  async function serveLine(line) {
    setUpdatingId(line.id);
    setActionError(null);
    try {
      await Promise.all(
        line.ids.map((id) => api.updateOrderItemStatus(id, "served")),
      );
      await refetch();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setUpdatingId(null);
    }
  }

  // Serve every remaining item of a single table at once.
  async function serveTable(group) {
    if (group.items.length === 0) return;
    if (
      !window.confirm(
        `Mark all ${group.items.length} item(s) of ${group.table_label} as served?`,
      )
    )
      return;
    setServingTableKey(group.key);
    setActionError(null);
    try {
      await Promise.all(
        group.items.map((item) => api.updateOrderItemStatus(item.id, "served")),
      );
      await refetch();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setServingTableKey(null);
    }
  }

  // Serve everything on the board, across every table.
  async function serveAllTables() {
    if (items.length === 0) return;
    if (!window.confirm(`Mark all ${items.length} item(s) below as served?`))
      return;
    setBulkUpdating(true);
    setActionError(null);
    try {
      await Promise.all(
        items.map((item) => api.updateOrderItemStatus(item.id, "served")),
      );
      await refetch();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBulkUpdating(false);
    }
  }

  return (
    <div className="bartender-orders">
      <div className="page-header">
        <h2>Incoming orders</h2>
        <div className="icon-button-group">
          <IconButton
            icon={RefreshIcon}
            label="Refresh"
            className="icon-button-outline"
            onClick={refetch}
          />
          <IconButton
            icon={DoubleCheckIcon}
            label={bulkUpdating ? "Marking…" : "Serve all tables"}
            className="icon-button-success"
            disabled={bulkUpdating || items.length === 0}
            onClick={serveAllTables}
          />
        </div>
      </div>

      {loading ? <p>Loading…</p> : null}
      {error ? <p className="error">{error}</p> : null}
      {actionError ? <p className="error">{actionError}</p> : null}

      {!loading && items.length === 0 ? (
        <p>No pending items — you're caught up.</p>
      ) : null}

      <div className="table-order-groups">
        {groupByTable(items).map((group) => (
          <div key={group.key} className="table-order-group">
            <div className="table-order-group-header">
              <span>
                {group.table_label}
                {group.client_name ? ` — ${group.client_name}` : ""}
              </span>
              <IconButton
                icon={DoubleCheckIcon}
                label={
                  servingTableKey === group.key
                    ? "Marking…"
                    : "Serve whole table"
                }
                className="icon-button-success icon-button-sm"
                disabled={servingTableKey === group.key}
                onClick={() => serveTable(group)}
              />
            </div>
            <table className="table-order-items">
              <tbody>
                {groupIdenticalItems(group.items).map((item) => (
                  <tr key={item.id} className={`status-${item.status}`}>
                    <td className="table-order-item-name">
                      {item.quantity} × {item.item_name}
                      {item.mixer_label ? ` + ${item.mixer_label}` : ""}
                      <span className="order-item-card-type">
                        {" "}
                        ({item.price_type === "bottle" ? "Bottle" : "Glass"})
                      </span>
                      {item.notes ? (
                        <div className="order-item-card-note">
                          Note: {item.notes}
                        </div>
                      ) : null}
                    </td>
                    <td className="table-order-item-status">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="table-order-item-action">
                      <IconButton
                        icon={CheckIcon}
                        label={
                          updatingId === item.id ? "Serving…" : "Serve"
                        }
                        className="icon-button-neutral"
                        disabled={updatingId === item.id}
                        onClick={() => serveLine(item)}
                      />
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
