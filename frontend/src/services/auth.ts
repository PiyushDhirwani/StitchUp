import api from './api';

export interface RegisterConsumerPayload {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  password: string;
  address_line1: string;
  city: string;
  state: string;
  postal_code: string;
  latitude?: number;
  longitude?: number;
  digipin?: string;
}

export interface RegisterTailorPayload {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  password: string;
  shop_name: string;
  shop_address: string;
  city: string;
  state: string;
  postal_code: string;
  years_of_experience: number;
  aadhar_number: string;
  address_proof?: File;
  latitude?: number;
  longitude?: number;
  digipin?: string;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
  session_id: string;
}

export interface RequestOtpPayload {
  email: string;
}

export const authService = {
  registerConsumer: (data: RegisterConsumerPayload) =>
    api.post('/auth/consumer/register', data),

  registerTailor: (data: RegisterTailorPayload) => {
    const formData = new FormData();
    formData.append('first_name', data.first_name);
    formData.append('last_name', data.last_name);
    formData.append('email', data.email);
    formData.append('phone_number', data.phone_number);
    formData.append('password', data.password);
    formData.append('shop_name', data.shop_name);
    formData.append('shop_address_line1', data.shop_address);
    formData.append('city', data.city);
    formData.append('state', data.state);
    formData.append('postal_code', data.postal_code);
    formData.append('years_of_experience', String(data.years_of_experience));
    formData.append('aadhar_number', data.aadhar_number);
    if (data.address_proof) {
      formData.append('address_proof', data.address_proof);
    }
    if (data.latitude != null) formData.append('latitude', String(data.latitude));
    if (data.longitude != null) formData.append('longitude', String(data.longitude));
    if (data.digipin) formData.append('digipin', data.digipin);
    return api.post('/auth/tailor/register', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  requestOtp: (data: RequestOtpPayload) =>
    api.post('/auth/login/request-otp', data),

  verifyOtp: (data: VerifyOtpPayload) =>
    api.post('/auth/login/verify-otp', data),
};
