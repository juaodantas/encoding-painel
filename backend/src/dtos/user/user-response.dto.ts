
export const userListResponseSchema = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      email: { type: 'string' },
      nome: { type: 'string' }
    }
  }
} as const;

export const userResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    email: { type: 'string' },
    nome: { type: 'string' }
  }
} as const;

export const errorResponseSchema = {
  type: 'object',
  properties: {
    message: { type: 'string' },
    code: { type: 'string' }
  }
} as const;

export const deleteUserResponseSchema = {
  type: 'object',
  properties: {
    message: { type: 'string' },
    id: { type: 'string' }
  }
} as const; 