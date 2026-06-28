/** Base URL for the DummyJSON REST API. */
const BASE_URL = 'https://dummyjson.com';

/**
 * Maps a raw DummyJSON user object to the shape used internally by the app.
 *
 * DummyJSON stores the department inside `company.department` and uses a
 * single `name` field for the full company name. This function flattens
 * that structure into a predictable, app-level user shape.
 *
 * @param {Object} rawUser - A user object as returned by the DummyJSON API.
 * @returns {{ id, firstName, lastName, email, department, phone, website }}
 */
function normalizeUser(rawUser) {
  return {
    id:         rawUser.id,
    firstName:  rawUser.firstName  || '',
    lastName:   rawUser.lastName   || '',
    email:      rawUser.email      || '',
    department: rawUser.company?.department || '',
    phone:      rawUser.phone      || '',
    // Derive a website URL from the company name (DummyJSON has no website field).
    website:    rawUser.company?.name
      ? rawUser.company.name.toLowerCase().replace(/\s+/g, '') + '.com'
      : '',
  };
}

/**
 * Builds the JSON body sent to DummyJSON for both create and update requests.
 * Extracted to avoid duplicating the same field mapping in `addUser` and `updateUser`.
 *
 * @param {Object} formData - Form values from the Add / Edit modal.
 * @returns {Object} Body object ready to be JSON-serialised.
 */
function buildUserPayload(formData) {
  return {
    firstName: formData.firstName,
    lastName:  formData.lastName,
    email:     formData.email,
    phone:     formData.phone,
    company:   { department: formData.department, name: formData.website },
  };
}

/**
 * Generic JSON fetch wrapper.
 *
 * Attaches a JSON content-type header and throws a descriptive Error
 * when the server responds with a non-2xx status code.
 *
 * @param {string} path    - API path relative to BASE_URL (e.g. '/users').
 * @param {Object} options - Optional fetch init options (method, body, headers).
 * @returns {Promise<Object>} Parsed JSON response body.
 * @throws {Error} When the HTTP response status is not ok.
 */
async function fetchJson(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetches all users from DummyJSON (up to 208).
 *
 * We request only the fields the app actually uses to minimise payload size.
 *
 * @returns {Promise<Array>} Array of normalised user objects.
 * @throws {Error} On network failure or non-2xx HTTP response.
 */
export async function getUsers() {
  const data = await fetchJson(
    '/users?limit=208&select=id,firstName,lastName,email,phone,company'
  );
  return data.users.map(normalizeUser);
}

/**
 * Creates a new user via the DummyJSON API.
 *
 * Note: DummyJSON is a mock API — it always returns a successful response
 * but does not actually persist data server-side.
 *
 * @param {Object} formData - Form values from the Add User modal.
 * @returns {Promise<void>}
 * @throws {Error} On network failure or non-2xx HTTP response.
 */
export async function addUser(formData) {
  await fetchJson('/users/add', {
    method: 'POST',
    body:   JSON.stringify(buildUserPayload(formData)),
  });
}

/**
 * Updates an existing user via the DummyJSON API.
 *
 * @param {number} userId   - The numeric ID of the user to update.
 * @param {Object} formData - Updated form values from the Edit User modal.
 * @returns {Promise<void>}
 * @throws {Error} On network failure or non-2xx HTTP response.
 */
export async function updateUser(userId, formData) {
  await fetchJson(`/users/${userId}`, {
    method: 'PUT',
    body:   JSON.stringify(buildUserPayload(formData)),
  });
}

/**
 * Deletes a user by ID via the DummyJSON API.
 *
 * @param {number} userId - The numeric ID of the user to delete.
 * @returns {Promise<void>}
 * @throws {Error} On network failure or non-2xx HTTP response.
 */
export async function deleteUser(userId) {
  const response = await fetch(`${BASE_URL}/users/${userId}`, { method: 'DELETE' });
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
}
