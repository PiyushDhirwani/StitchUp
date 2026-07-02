export const validators = {
  email: (v: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Enter a valid email address',

  phone: (v: string) =>
    /^[6-9][0-9]{9}$/.test(v) ? '' : 'Enter a valid 10-digit Indian mobile number',

  password: (v: string) => {
    if (v.length < 8) return 'Minimum 8 characters';
    if (!/[A-Z]/.test(v)) return 'Must contain an uppercase letter';
    if (!/[a-z]/.test(v)) return 'Must contain a lowercase letter';
    if (!/[0-9]/.test(v)) return 'Must contain a number';
    if (!/[!@#$%^&*()_+\-={}|;:'",.<>?/`~]/.test(v)) return 'Must contain a special character';
    return '';
  },

  pincode: (v: string) =>
    /^[1-9][0-9]{5}$/.test(v) ? '' : 'Enter a valid 6-digit PIN code',

  aadhar: (v: string) =>
    /^[2-9][0-9]{11}$/.test(v) ? '' : 'Enter a valid 12-digit Aadhaar number',

  required: (v: string) =>
    v.trim() ? '' : 'This field is required',
};

/** Must match backend CloudinaryService rules (JPEG/PNG/WebP/SVG, 5MB) */
export const IMAGE_UPLOAD = {
  ACCEPT: 'image/jpeg,image/png,image/webp,image/svg+xml',
  MIME_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
  MAX_SIZE_BYTES: 5 * 1024 * 1024,
  LABEL: 'JPEG, PNG, WebP, or SVG — max 5MB',
} as const;

export function validateImageFile(file: File): string {
  if (!IMAGE_UPLOAD.MIME_TYPES.includes(file.type as any)) {
    return 'Only JPEG, PNG, WebP, and SVG images are allowed';
  }
  if (file.size > IMAGE_UPLOAD.MAX_SIZE_BYTES) {
    return 'Image must be under 5MB';
  }
  return '';
}

export type FieldErrors = Record<string, string>;

export function validateForm(
  form: Record<string, string>,
  rules: Record<string, Array<(v: string) => string>>,
): FieldErrors {
  const errors: FieldErrors = {};
  for (const [field, fieldRules] of Object.entries(rules)) {
    for (const rule of fieldRules) {
      const err = rule(form[field] || '');
      if (err) {
        errors[field] = err;
        break;
      }
    }
  }
  return errors;
}
