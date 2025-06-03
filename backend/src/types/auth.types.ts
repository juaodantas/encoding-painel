export interface User {
  id: string;
  email: string;
  nome: string;
}

export interface RegisterResponse {
  message: string;
  user: User;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface AuthError {
  message: string;
  code: 'EMAIL_EXISTS' | 'USER_NOT_FOUND' | 'INVALID_PASSWORD' | 'INVALID_CREDENTIALS';
} 