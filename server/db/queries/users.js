import { query } from '../../db.js';

export async function findUserByEmail(email) {
  const { rows } = await query('select * from users where email = $1', [email]);
  return rows[0] || null;
}

export async function findUserById(id) {
  const { rows } = await query(
    'select id, full_name, email, role, active, created_at from users where id = $1',
    [id]
  );
  return rows[0] || null;
}

// Includes password_hash — for internal use only (e.g. merging a partial
// update onto the existing row). Never send this row directly to a client.
export async function findUserRawById(id) {
  const { rows } = await query('select * from users where id = $1', [id]);
  return rows[0] || null;
}

export async function listUsers() {
  const { rows } = await query(
    'select id, full_name, email, role, active, created_at from users order by full_name'
  );
  return rows;
}

export async function createUser({ fullName, email, passwordHash, role }) {
  const { rows } = await query(
    `insert into users (full_name, email, password_hash, role)
     values ($1, $2, $3, $4)
     returning id, full_name, email, role, active, created_at`,
    [fullName, email, passwordHash, role]
  );
  return rows[0];
}

// Full-row update. Callers (route handlers) merge partial edits onto the
// existing row first via findUserById, so omitted fields keep their value.
export async function updateUser(id, { fullName, role, active, passwordHash }) {
  const { rows } = await query(
    `update users set
       full_name = $2,
       role = $3,
       active = $4,
       password_hash = $5
     where id = $1
     returning id, full_name, email, role, active, created_at`,
    [id, fullName, role, active, passwordHash]
  );
  return rows[0] || null;
}
