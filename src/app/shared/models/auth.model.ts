// src/app/shared/models/auth.model.ts
export interface LoginRequest {
  username: string;
  password: string;
}

export interface JwtLoginResponse {
  tokenType: string;
  accessToken: string;
  username: string;
  roles: string[];
}

export interface CurrentUserResponse {
  username: string;
  roles: string[];
}