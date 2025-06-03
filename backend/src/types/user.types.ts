export interface User {
  id: string;
  email: string;
  nome: string;
  password?: string;
}

export interface CreateUserBody {
  email: string;
  password: string;
  nome: string;
}

export interface UpdateUserBody {
  email?: string;
  password?: string;
}

export interface UserResponse {
  id: string;
  email: string;
  nome: string;
}

export interface DeleteUserResponse {
  message: string;
  id: string;
}

export interface UserError {
  message: string;
  code: 'USER_NOT_FOUND' | 'INVALID_DATA' | 'SERVER_ERROR';
} 