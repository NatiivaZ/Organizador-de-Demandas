// Tipos para as APIs

export interface User {
  id: number
  username: string
  password: string
  role: 'USER' | 'ADMIN' | 'MODERATOR'
  accessLevel: number
  createdAt: Date
  updatedAt: Date
}

export interface List {
  id: number
  name: string
  order: number
  requiredAccessLevel: number
  isPublic: boolean
  cards: Card[]
  createdAt: Date
  updatedAt: Date
}

export interface Card {
  id: number
  listId: number
  title: string
  description?: string
  date?: string
  label?: string
  attachment?: string
  userId: number
  createdAt: Date
  updatedAt: Date
  list?: List
  user?: {
    id: number
    username: string
  }
}

// Tipos para requests das APIs

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  password: string
}

export interface CreateListRequest {
  name: string
}

export interface UpdateListRequest {
  name: string
}

export interface CreateCardRequest {
  listId: number
  title: string
  description?: string
  date?: string
  label?: string
  attachment?: string
  userId: number
}

export interface UpdateCardRequest {
  listId?: number
  title: string
  description?: string
  date?: string
  label?: string
  attachment?: string
}

export interface MoveCardRequest {
  listId: number
}

// Tipos para responses das APIs

export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
}

export interface LoginResponse {
  user: {
    id: number
    username: string
  }
}

export interface RegisterResponse {
  user: {
    id: number
    username: string
  }
} 