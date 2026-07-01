import { useState } from 'react';
import { useMenuItems } from '../../hooks/useMenuItems.js';
import { api } from '../../api/apiClient.js';
import { groupMenuItems, CATEGORIES } from '../../lib/pricing.js';
import { TableScroll } from '../../components/TableScroll.jsx';
import { IconButton } from '../../components/IconButton.jsx';
import { RefreshIcon, CheckIcon, TrashIcon, PlusIcon } from '../../components/icons.jsx';

// Spirits/wine are always sold by bottle or glass and never have a
// description in practice — only cocktails/shots/etc. actually use it.
const BOTTLE_CATEGORIES = new Set(['spirits', 'wine_bubbles']);

function MenuItemEditRow({ item, onSaved }) {
  const showDescription = !BOTTLE_CATEGORIES.has(item.category);
  const [draft, setDraft] = useState({
    name: item.name,
    description: item.description || '',
    bottlePrice: item.bottle_price ?? '',
    glassPrice: item.glass_price ?? '',
    active: item.active,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  function update(field, value) {
    setDraft((d) => ({ ...d, [field]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await api.updateMenuItem(item.id, {
        name: draft.name,
        description: draft.description || null,
        bottlePrice: draft.bottlePrice === '' ? null : Number(draft.bottlePrice),
        glassPrice: draft.glassPrice === '' ? null : Number(draft.glassPrice),
        active: draft.active,
      });
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Delete "${item.name}"? This can't be undone.`)) return;
    setSaving(true);
    setError(null);
    try {
      await api.deleteMenuItem(item.id);
      onSaved();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <tr className={draft.active ? '' : 'menu-item-inactive'}>
      <td>
        <input value={draft.name} onChange={(e) => update('name', e.target.value)} />
        {showDescription ? (
          <input
            className="menu-item-description"
            value={draft.description}
            onChange={(e) => update('description', e.target.value)}
            placeholder="description (optional)"
          />
        ) : null}
      </td>
      <td className="menu-edit-price">
        <input
          type="number"
          value={draft.bottlePrice}
          onChange={(e) => update('bottlePrice', e.target.value)}
          placeholder="-"
        />
      </td>
      <td className="menu-edit-price">
        <input
          type="number"
          value={draft.glassPrice}
          onChange={(e) => update('glassPrice', e.target.value)}
          placeholder="-"
        />
      </td>
      <td>
        <input type="checkbox" checked={draft.active} onChange={(e) => update('active', e.target.checked)} />
      </td>
      <td className="menu-edit-actions">
        {error ? <span className="error">{error}</span> : null}
        <div className="icon-button-group">
          <IconButton
            icon={CheckIcon}
            label="Save"
            className="icon-button-success icon-button-sm"
            disabled={saving}
            onClick={handleSave}
          />
          <IconButton
            icon={TrashIcon}
            label="Delete"
            className="icon-button-danger icon-button-sm"
            disabled={saving}
            onClick={handleDelete}
          />
        </div>
      </td>
    </tr>
  );
}

function NewItemForm({ onCreated }) {
  const [form, setForm] = useState({
    category: 'spirits',
    subcategory: '',
    name: '',
    description: '',
    bottlePrice: '',
    glassPrice: '',
  });
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api.createMenuItem({
        category: form.category,
        subcategory: form.subcategory,
        name: form.name,
        description: form.description || null,
        bottlePrice: form.bottlePrice === '' ? null : Number(form.bottlePrice),
        glassPrice: form.glassPrice === '' ? null : Number(form.glassPrice),
      });
      onCreated();
      setForm((f) => ({ ...f, name: '', description: '', bottlePrice: '', glassPrice: '' }));
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="new-menu-item-form" onSubmit={handleSubmit}>
      <h3>Add menu item</h3>
      {error ? <p className="error">{error}</p> : null}
      <select value={form.category} onChange={(e) => update('category', e.target.value)}>
        {CATEGORIES.map((c) => (
          <option key={c.id} value={c.id}>
            {c.label}
          </option>
        ))}
      </select>
      <input
        placeholder="Subcategory (e.g. Whiskey)"
        value={form.subcategory}
        onChange={(e) => update('subcategory', e.target.value)}
        required
      />
      <input placeholder="Name" value={form.name} onChange={(e) => update('name', e.target.value)} required />
      <input
        placeholder="Description (optional)"
        value={form.description}
        onChange={(e) => update('description', e.target.value)}
      />
      <input
        type="number"
        placeholder="Bottle price"
        value={form.bottlePrice}
        onChange={(e) => update('bottlePrice', e.target.value)}
      />
      <input
        type="number"
        placeholder="Glass / single price"
        value={form.glassPrice}
        onChange={(e) => update('glassPrice', e.target.value)}
      />
      <div className="icon-button-group">
        <IconButton
          icon={PlusIcon}
          label={saving ? 'Adding…' : 'Add item'}
          type="submit"
          className="icon-button-success"
          disabled={saving}
        />
      </div>
    </form>
  );
}

export function MenuTab() {
  const { items, loading, error, refetch } = useMenuItems({ all: true });
  const grouped = groupMenuItems(items).filter((c) => c.subcategories.some((s) => s.items.length));

  return (
    <div className="manager-tab menu-tab">
      <div className="page-header">
        <h2>Menu editor</h2>
        <IconButton icon={RefreshIcon} label="Refresh" className="icon-button-outline" onClick={refetch} />
      </div>
      {loading ? <p>Loading…</p> : null}
      {error ? <p className="error">{error}</p> : null}

      {grouped.map((cat) => (
        <div key={cat.id}>
          <h3>{cat.label}</h3>
          {cat.subcategories.map((sub) => (
            <div key={sub.name}>
              <h4 className="sub_menu">{sub.name}</h4>
              <TableScroll>
                <table className="manager-table menu-edit-table">
                  <tbody>
                    <tr>
                      <th>Name / description</th>
                      <th className="menu-edit-price">Bottle</th>
                      <th className="menu-edit-price">Glass / price</th>
                      <th>Active</th>
                      <th></th>
                    </tr>
                    {sub.items.map((item) => (
                      <MenuItemEditRow key={item.id} item={item} onSaved={refetch} />
                    ))}
                  </tbody>
                </table>
              </TableScroll>
            </div>
          ))}
        </div>
      ))}

      <NewItemForm onCreated={refetch} />
    </div>
  );
}
