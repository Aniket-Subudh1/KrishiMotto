export type BackendUserRole =
  | 'FARMER'
  | 'EXPERT'
  | 'OPERATOR'
  | 'LENDER'
  | 'AGENT'
  | 'ADMIN';

export type UserStatus = 'PENDING_OTP' | 'ACTIVE' | 'SUSPENDED';

export type AuthUser = {
  id: string;
  role: BackendUserRole;
  username: string;
  phoneNumber: string;
  email?: string;
  status: UserStatus;
  language: string;
};

export type FarmerRegisterPayload = {
  username: string;
  phoneNumber: string;
};

export type FarmerRegisterResponse = {
  id: string;
};

export type SendOtpPayload = {
  phoneNumber: string;
};

export type SendOtpResponse = {
  sent: boolean;
};

export type FarmerAuthenticatePayload = {
  phoneNumber: string;
  otp: string;
};

export type ExpertRegisterPayload = {
  username: string;
  email: string;
  phoneNumber: string;
};

export type ExpertRegisterResponse = {
  id: string;
};

export type ExpertAuthenticatePayload = {
  phoneNumber: string;
  otp: string;
};

export type AuthTokensResponse = {
  token: string;
  refreshToken: string;
  user: AuthUser;
};

export type RefreshTokenResponse = {
  accessToken: string;
  refreshToken: string;
};
