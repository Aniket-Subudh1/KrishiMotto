export type UserRole = 'farmer' | 'expert' | 'admin';

export type User = {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  language?: string;
  avatarUrl?: string;
};

export type LoginPayload = {
  phone: string;
  otp: string;
};

export type RegisterPayload = {
  name: string;
  phone: string;
  role: 'farmer' | 'expert';
  language?: string;
};

export type RequestOtpPayload = {
  phone: string;
};

export type AuthResponse = {
  user: User;
  token: string;
  refreshToken: string;
};
