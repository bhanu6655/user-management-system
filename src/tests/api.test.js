import { describe, it, expect, vi, afterEach } from 'vitest';

// ── normalizeUser (tested indirectly via getUsers) ────────────────────────────
// We import the module-internal helper behaviour by testing getUsers with a
// mocked fetch that returns a controlled DummyJSON-shaped response.

// ── fetchJson error handling ──────────────────────────────────────────────────

describe('API fetch error handling', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('throws an Error when the server responds with a non-2xx status', async () => {
    // Arrange — mock fetch to return a 404 response.
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok:         false,
      status:     404,
      statusText: 'Not Found',
    }));

    // Act & Assert — getUsers should surface the HTTP error.
    const { getUsers } = await import('../api.js');
    await expect(getUsers()).rejects.toThrow('HTTP 404: Not Found');
  });

  it('throws an Error when the server responds with a 500 status', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok:         false,
      status:     500,
      statusText: 'Internal Server Error',
    }));

    const { getUsers } = await import('../api.js');
    await expect(getUsers()).rejects.toThrow('HTTP 500');
  });
});

// ── DummyJSON field mapping (normalizeUser) ───────────────────────────────────

describe('getUsers() — normalizeUser mapping', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('correctly maps DummyJSON fields to the app user shape', async () => {
    const mockRawUser = {
      id:        42,
      firstName: 'Jane',
      lastName:  'Doe',
      email:     'jane.doe@example.com',
      phone:     '+1-555-100-1000',
      company:   { department: 'Engineering', name: 'Acme Corp' },
    };

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok:   true,
      json: async () => ({ users: [mockRawUser] }),
    }));

    const { getUsers } = await import('../api.js');
    const users = await getUsers();

    expect(users).toHaveLength(1);
    expect(users[0]).toMatchObject({
      id:         42,
      firstName:  'Jane',
      lastName:   'Doe',
      email:      'jane.doe@example.com',
      department: 'Engineering',
      phone:      '+1-555-100-1000',
    });
    // Website is derived from company.name.
    expect(users[0].website).toContain('acmecorp');
  });

  it('uses empty strings as fallbacks for missing optional fields', async () => {
    const mockRawUser = { id: 1, firstName: 'No', lastName: 'Company', email: 'x@x.com', phone: '' };

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok:   true,
      json: async () => ({ users: [mockRawUser] }),
    }));

    const { getUsers } = await import('../api.js');
    const users = await getUsers();

    expect(users[0].department).toBe('');
    expect(users[0].website).toBe('');
  });
});
