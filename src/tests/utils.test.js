import { describe, it, expect } from 'vitest';
import { validate, getPageRange, filterUsers, sortUsers } from '../utils.js';

// ── validate() ───────────────────────────────────────────────────────────────

describe('validate()', () => {
  describe('required fields', () => {
    it('returns an error when a required field is empty', () => {
      expect(validate('firstName', '')).toBe('This field is required.');
      expect(validate('lastName',  '')).toBe('This field is required.');
      expect(validate('email',     '')).toBe('This field is required.');
      expect(validate('department','')).toBe('This field is required.');
    });

    it('returns no error when a required field has a valid value', () => {
      expect(validate('firstName',  'John')).toBe('');
      expect(validate('department', 'Engineering')).toBe('');
    });
  });

  describe('optional fields', () => {
    it('returns no error when an optional field is empty', () => {
      expect(validate('phone',   '')).toBe('');
      expect(validate('website', '')).toBe('');
    });
  });

  describe('name length', () => {
    it('returns an error when firstName is shorter than 2 characters', () => {
      expect(validate('firstName', 'A')).toBe('Must be at least 2 characters.');
    });

    it('returns an error when lastName is shorter than 2 characters', () => {
      expect(validate('lastName', 'B')).toBe('Must be at least 2 characters.');
    });

    it('returns no error when name is 2 or more characters', () => {
      expect(validate('firstName', 'Jo')).toBe('');
    });
  });

  describe('email format', () => {
    it('returns an error for a malformed email address', () => {
      expect(validate('email', 'notanemail')).toBe('Enter a valid email address.');
      expect(validate('email', 'missing@tld')).toBe('Enter a valid email address.');
      expect(validate('email', '@nodomain.com')).toBe('Enter a valid email address.');
    });

    it('returns no error for a well-formed email address', () => {
      expect(validate('email', 'user@example.com')).toBe('');
      expect(validate('email', 'user+tag@sub.domain.org')).toBe('');
    });
  });

  describe('phone format', () => {
    it('returns an error when a phone number is too short', () => {
      expect(validate('phone', '123')).toBe('Enter a valid phone number.');
    });

    it('returns no error for a valid phone number', () => {
      expect(validate('phone', '+1-555-000-0000')).toBe('');
      expect(validate('phone', '(555) 123-4567')).toBe('');
    });
  });

  describe('website format', () => {
    it('returns an error for an invalid URL', () => {
      expect(validate('website', 'not a url')).toBe('Enter a valid URL.');
    });

    it('returns no error for a valid URL with or without protocol', () => {
      expect(validate('website', 'https://example.com')).toBe('');
      expect(validate('website', 'example.com')).toBe('');
    });
  });
});

// ── getPageRange() ────────────────────────────────────────────────────────────

describe('getPageRange()', () => {
  it('returns every page number when total is 7 or fewer', () => {
    expect(getPageRange(1, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(getPageRange(3, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('inserts an ellipsis when there is a gap on the right', () => {
    const range = getPageRange(1, 20);
    expect(range).toContain('…');
    expect(range[0]).toBe(1);
    expect(range[range.length - 1]).toBe(20);
  });

  it('inserts ellipses on both sides when current page is in the middle', () => {
    const range = getPageRange(10, 20);
    expect(range.filter(p => p === '…').length).toBe(2);
    expect(range).toContain(10);
    expect(range).toContain(1);
    expect(range).toContain(20);
  });

  it('always includes the first and last page', () => {
    const range = getPageRange(5, 15);
    expect(range[0]).toBe(1);
    expect(range[range.length - 1]).toBe(15);
  });
});

// ── filterUsers() ─────────────────────────────────────────────────────────────

describe('filterUsers()', () => {
  const users = [
    { id: 1, firstName: 'Alice', lastName: 'Smith',   email: 'alice@test.com',   department: 'Engineering' },
    { id: 2, firstName: 'Bob',   lastName: 'Johnson', email: 'bob@example.com',  department: 'Design' },
    { id: 3, firstName: 'Carol', lastName: 'White',   email: 'carol@company.io', department: 'Engineering' },
  ];

  it('returns all users when search and filters are empty', () => {
    expect(filterUsers(users, '', { firstName: '', lastName: '', email: '', department: '' })).toHaveLength(3);
  });

  it('filters by free-text search across firstName, lastName, email, and department', () => {
    expect(filterUsers(users, 'alice', { firstName: '', lastName: '', email: '', department: '' })).toHaveLength(1);
    expect(filterUsers(users, 'engineering', { firstName: '', lastName: '', email: '', department: '' })).toHaveLength(2);
  });

  it('applies column filters independently', () => {
    const result = filterUsers(users, '', { firstName: '', lastName: '', email: '', department: 'Design' });
    expect(result).toHaveLength(1);
    expect(result[0].firstName).toBe('Bob');
  });

  it('returns an empty array when no users match', () => {
    expect(filterUsers(users, 'zzznomatch', { firstName: '', lastName: '', email: '', department: '' })).toHaveLength(0);
  });
});

// ── sortUsers() ───────────────────────────────────────────────────────────────

describe('sortUsers()', () => {
  const users = [
    { id: 3, firstName: 'Carol', lastName: 'White',   email: 'c@test.com', department: 'HR' },
    { id: 1, firstName: 'Alice', lastName: 'Smith',   email: 'a@test.com', department: 'Engineering' },
    { id: 2, firstName: 'Bob',   lastName: 'Johnson', email: 'b@test.com', department: 'Design' },
  ];

  it('sorts by id ascending', () => {
    const sorted = sortUsers(users, 'id', 'asc');
    expect(sorted.map(u => u.id)).toEqual([1, 2, 3]);
  });

  it('sorts by id descending', () => {
    const sorted = sortUsers(users, 'id', 'desc');
    expect(sorted.map(u => u.id)).toEqual([3, 2, 1]);
  });

  it('sorts by firstName alphabetically', () => {
    const sorted = sortUsers(users, 'firstName', 'asc');
    expect(sorted.map(u => u.firstName)).toEqual(['Alice', 'Bob', 'Carol']);
  });

  it('sorts by firstName in reverse alphabetical order', () => {
    const sorted = sortUsers(users, 'firstName', 'desc');
    expect(sorted.map(u => u.firstName)).toEqual(['Carol', 'Bob', 'Alice']);
  });

  it('does not mutate the original array', () => {
    const original = [...users];
    sortUsers(users, 'id', 'asc');
    expect(users).toEqual(original);
  });
});
