import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { FormEvent } from 'react';
import { authService } from '@/services/auth';
import { lookupPincode } from '@/services/pincode';
import { useGeolocation } from '@/hooks/useGeolocation';
import { validators, type FieldErrors } from '@/lib/validate';
import type { UserRole, RegisterFormState } from '@/types/auth.types';

const initialForm: RegisterFormState = {
  first_name: '',
  last_name: '',
  email: '',
  phone_number: '',
  password: '',
  address_line1: '',
  city: '',
  state: '',
  postal_code: '',
  shop_name: '',
  shop_address: '',
  years_of_experience: '',
  aadhar_number: '',
};

export function useRegister() {
  const navigate = useNavigate();
  const geo = useGeolocation();
  const [role, setRole] = useState<UserRole>('consumer');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeDistrict, setPincodeDistrict] = useState('');
  const [addressProofFile, setAddressProofFile] = useState<File | null>(null);
  const [form, setForm] = useState<RegisterFormState>(initialForm);

  const set = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handlePincodeLookup = useCallback(async (pincode: string) => {
    if (!/^[1-9][0-9]{5}$/.test(pincode)) {
      setPincodeDistrict('');
      return;
    }
    setPincodeLoading(true);
    const result = await lookupPincode(pincode);
    setPincodeLoading(false);
    if (result) {
      setForm((prev) => ({ ...prev, city: result.city, state: result.state }));
      setPincodeDistrict(result.district);
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.city;
        delete next.state;
        delete next.postal_code;
        return next;
      });
    } else {
      setPincodeDistrict('');
      setFieldErrors((prev) => ({ ...prev, postal_code: 'Invalid PIN code' }));
    }
  }, []);

  useEffect(() => {
    const pin = form.postal_code;
    if (pin.length === 6) {
      const timeout = setTimeout(() => handlePincodeLookup(pin), 300);
      return () => clearTimeout(timeout);
    } else {
      setPincodeDistrict('');
    }
  }, [form.postal_code, handlePincodeLookup]);

  const validateBeforeSubmit = (): boolean => {
    const errors: FieldErrors = {};
    if (!form.first_name.trim()) errors.first_name = 'Required';
    if (!form.last_name.trim()) errors.last_name = 'Required';

    const emailErr = validators.email(form.email);
    if (emailErr) errors.email = emailErr;

    const phoneErr = validators.phone(form.phone_number);
    if (phoneErr) errors.phone_number = phoneErr;

    const passErr = validators.password(form.password);
    if (passErr) errors.password = passErr;

    const pinErr = validators.pincode(form.postal_code);
    if (pinErr) errors.postal_code = pinErr;

    if (!form.city.trim()) errors.city = 'Required';
    if (!form.state.trim()) errors.state = 'Required';

    if (role === 'consumer') {
      if (!form.address_line1.trim()) errors.address_line1 = 'Required';
    }
    if (role === 'tailor') {
      if (!form.shop_name.trim()) errors.shop_name = 'Required';
      if (!form.shop_address.trim()) errors.shop_address = 'Required';
      const aadharErr = validators.aadhar(form.aadhar_number);
      if (aadharErr) errors.aadhar_number = aadharErr;
      if (!addressProofFile) errors.address_proof = 'Address proof document is required';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddressProofChange = (file: File | null) => {
    setAddressProofFile(file);
    if (file && fieldErrors.address_proof) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.address_proof;
        return next;
      });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validateBeforeSubmit()) return;
    setLoading(true);

    try {
      let res;
      if (role === 'consumer') {
        res = await authService.registerConsumer({
          first_name: form.first_name,
          last_name: form.last_name,
          email: form.email,
          phone_number: form.phone_number,
          password: form.password,
          address_line1: form.address_line1,
          city: form.city,
          state: form.state,
          postal_code: form.postal_code,
          latitude: geo.location?.latitude,
          longitude: geo.location?.longitude,
          digipin: geo.location?.digipin,
        });
      } else {
        res = await authService.registerTailor({
          first_name: form.first_name,
          last_name: form.last_name,
          email: form.email,
          phone_number: form.phone_number,
          password: form.password,
          shop_name: form.shop_name,
          shop_address: form.shop_address,
          city: form.city,
          state: form.state,
          postal_code: form.postal_code,
          years_of_experience: Number(form.years_of_experience) || 0,
          aadhar_number: form.aadhar_number,
          address_proof: addressProofFile || undefined,
          latitude: geo.location?.latitude,
          longitude: geo.location?.longitude,
          digipin: geo.location?.digipin,
        });
      }

      const { session_id, otp_expiry_seconds } = res.data.data;
      navigate('/verify-otp', {
        state: {
          session_id,
          email: form.email,
          otp_expiry_seconds,
          flow: 'register',
        },
      });
    } catch (err: any) {
      const msg =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return {
    role,
    setRole,
    showPassword,
    setShowPassword,
    loading,
    error,
    fieldErrors,
    pincodeLoading,
    pincodeDistrict,
    addressProofFile,
    handleAddressProofChange,
    form,
    set,
    geo,
    handleSubmit,
  };
}
