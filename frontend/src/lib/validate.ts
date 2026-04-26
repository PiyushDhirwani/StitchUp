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
