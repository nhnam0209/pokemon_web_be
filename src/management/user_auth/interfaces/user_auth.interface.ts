export interface ManagementLoginRequestData {
  username: string;
  password: string;
}

export interface ManagementLoginResponseData {
  user: {
    id: number;
    username: string;
  };
  accessToken: string;
}

export interface RegisterManagementRequestData {
  fullname: string;
  email: string;
  username: string;
  password: string;
}
export interface ResetPasswordData {
  username?: string;
  email?: string;
  newPassword?: string;
}
