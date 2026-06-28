const API = 'https://jsonplaceholder.typicode.com';

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  return res.json();
}

function normalizeUser(u) {
  const parts = (u.name || '').trim().split(/\s+/);
  return {
    id: u.id,
    firstName: parts[0] || '',
    lastName: parts.slice(1).join(' ') || '',
    email: u.email || '',
    department: u.company?.name || '',
    phone: u.phone || '',
    website: u.website || '',
  };
}

export async function getUsers() {
  const data = await apiFetch('/users');
  return data.map(normalizeUser);
}

export async function addUser(data) {
  await apiFetch('/users', {
    method: 'POST',
    body: JSON.stringify({
      name: `${data.firstName} ${data.lastName}`,
      email: data.email,
      phone: data.phone,
      website: data.website,
      company: { name: data.department },
    }),
  });
}

export async function updateUser(id, data) {
  await apiFetch(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      id,
      name: `${data.firstName} ${data.lastName}`,
      email: data.email,
      phone: data.phone,
      website: data.website,
      company: { name: data.department },
    }),
  });
}

export async function deleteUser(id) {
  const res = await fetch(`${API}/users/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}
