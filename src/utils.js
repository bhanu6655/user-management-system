export function validate(name, value) {
  const v = value.trim();
  const required = ['firstName', 'lastName', 'email', 'department'];
  if (required.includes(name) && !v) return 'This field is required.';
  if (!v) return '';
  if ((name === 'firstName' || name === 'lastName') && v.length < 2) return 'Must be at least 2 characters.';
  if (name === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'Enter a valid email address.';
  if (name === 'phone' && !/^[+\d\s\-().]{7,20}$/.test(v)) return 'Enter a valid phone number.';
  if (name === 'website' && !/^(https?:\/\/)?([\w\d\-]+\.)+[\w]{2,}(\/.*)?$/i.test(v)) return 'Enter a valid URL.';
  return '';
}

export function getPageRange(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const set = new Set([1, total, current, current - 1, current + 1].filter(p => p >= 1 && p <= total));
  const sorted = [...set].sort((a, b) => a - b);
  const result = [];
  let prev = 0;
  for (const p of sorted) {
    if (p - prev > 1) result.push('…');
    result.push(p);
    prev = p;
  }
  return result;
}

export const GRADIENTS = [
  'linear-gradient(135deg,#6366f1,#8b5cf6)',
  'linear-gradient(135deg,#06b6d4,#6366f1)',
  'linear-gradient(135deg,#8b5cf6,#ec4899)',
  'linear-gradient(135deg,#f59e0b,#ef4444)',
  'linear-gradient(135deg,#22c55e,#06b6d4)',
  'linear-gradient(135deg,#f97316,#f59e0b)',
  'linear-gradient(135deg,#ec4899,#8b5cf6)',
  'linear-gradient(135deg,#14b8a6,#22c55e)',
];
