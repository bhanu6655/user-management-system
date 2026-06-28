const API = 'https://dummyjson.com';

function normalizeUser(u) {
  return {
    id:         u.id,
    firstName:  u.firstName || '',
    lastName:   u.lastName  || '',
    email:      u.email     || '',
    department: u.company?.department || '',
    phone:      u.phone     || '',
    website:    u.company?.name ? u.company.name.toLowerCase().replace(/\s+/g, '') + '.com' : '',
  };
}

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  return res.json();
}

export async function getUsers() {
  const data = await apiFetch('/users?limit=208&select=id,firstName,lastName,email,phone,company');
  return data.users.map(normalizeUser);
}

export async function addUser(data) {
  await apiFetch('/users/add', {
    method: 'POST',
    body: JSON.stringify({
      firstName: data.firstName,
      lastName:  data.lastName,
      email:     data.email,
      phone:     data.phone,
      company:   { department: data.department, name: data.website },
    }),
  });
}

export async function updateUser(id, data) {
  await apiFetch(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      firstName: data.firstName,
      lastName:  data.lastName,
      email:     data.email,
      phone:     data.phone,
      company:   { department: data.department, name: data.website },
    }),
  });
}

export async function deleteUser(id) {
  const res = await fetch(`${API}/users/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}
