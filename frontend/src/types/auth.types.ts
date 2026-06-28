export type LoginMode = 'otp' | 'password';
export type UserRole = 'consumer' | 'tailor';

export interface LoginUser {
  user_id?: number;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
  role?: string;
  consumer_id?: number;
  tailor_id?: number;
  auth_token?: string;
  refresh_token?: string;
}

export interface RegisterFormState {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  password: string;
  address_line1: string;
  city: string;
  state: string;
  postal_code: string;
  shop_name: string;
  shop_address: string;
  years_of_experience: string;
  aadhar_number: string;
  [key: string]: string;
}
