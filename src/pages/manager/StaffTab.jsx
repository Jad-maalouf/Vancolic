import { useState } from 'react';
import { useUsers } from '../../hooks/useUsers.js';
import { api } from '../../api/apiClient.js';
import { TableScroll } from '../../components/TableScroll.jsx';
import { IconButton } from '../../components/IconButton.jsx';
import { RefreshIcon, CheckIcon, PlusIcon } from '../../components/icons.jsx';

const ROLES = ['manager', 'bartender', 'waiter'];

function StaffRow({ user, onSaved }) {
  const [role, setRole] = useState(user.role);
  const [active, setActive] = useState(user.active);
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await api.updateUser(user.id, {
        role,
        active,
        password: newPassword.trim() || undefined,
      });
      setNewPassword('');
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <tr>
      <td>{user.full_name}</td>
      <td>{user.email}</td>
      <td>
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </td>
      <td>
        <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
      </td>
      <td>
        <input
          type="password"
          placeholder="new password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
      </td>
      <td>
        {error ? <span className="error">{error}</span> : null}
        <IconButton
          icon={CheckIcon}
          label="Save"
          className="icon-button-success icon-button-sm"
          disabled={saving}
          onClick={handleSave}
        />
      </td>
    </tr>
  );
}

function NewStaffForm({ onCreated }) {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', role: 'waiter' });
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
      await api.createUser(form);
      onCreated();
      setForm({ fullName: '', email: '', password: '', role: 'waiter' });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="new-staff-form" onSubmit={handleSubmit}>
      <h3>Add staff account</h3>
      {error ? <p className="error">{error}</p> : null}
      <input
        placeholder="Full name"
        value={form.fullName}
        onChange={(e) => update('fullName', e.target.value)}
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={(e) => update('email', e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Temporary password"
        value={form.password}
        onChange={(e) => update('password', e.target.value)}
        required
      />
      <select value={form.role} onChange={(e) => update('role', e.target.value)}>
        {ROLES.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
      <div className="icon-button-group">
        <IconButton
          icon={PlusIcon}
          label={saving ? 'Adding…' : 'Add staff'}
          type="submit"
          className="icon-button-success"
          disabled={saving}
        />
      </div>
    </form>
  );
}

export function StaffTab() {
  const { users, loading, error, refetch } = useUsers();

  return (
    <div className="manager-tab staff-tab">
      <div className="page-header">
        <h2>Staff accounts</h2>
        <IconButton icon={RefreshIcon} label="Refresh" className="icon-button-outline" onClick={refetch} />
      </div>
      {loading ? <p>Loading…</p> : null}
      {error ? <p className="error">{error}</p> : null}

      <TableScroll>
        <table className="manager-table">
          <tbody>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Active</th>
              <th>Reset password</th>
              <th></th>
            </tr>
            {users.map((user) => (
              <StaffRow key={user.id} user={user} onSaved={refetch} />
            ))}
          </tbody>
        </table>
      </TableScroll>

      <NewStaffForm onCreated={refetch} />
    </div>
  );
}
