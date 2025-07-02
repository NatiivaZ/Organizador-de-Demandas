// Utilitários para as APIs

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api'

export class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }))
      throw new Error(error.error || `HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  // Autenticação
  async login(username: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })
  }

  async register(username: string, password: string) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })
  }

  // Listas
  async getLists() {
    return this.request('/lists')
  }

  async createList(name: string) {
    return this.request('/lists', {
      method: 'POST',
      body: JSON.stringify({ name }),
    })
  }

  async updateList(id: number, name: string) {
    return this.request(`/lists/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name }),
    })
  }

  async deleteList(id: number) {
    return this.request(`/lists/${id}`, {
      method: 'DELETE',
    })
  }

  async updateListsOrder(orders: {id: number, order: number}[]) {
    return this.request('/lists', {
      method: 'PATCH',
      body: JSON.stringify({ orders }),
    })
  }

  // Cartões
  async getCards() {
    return this.request('/cards')
  }

  async createCard(data: {
    listId: number
    title: string
    description?: string
    date?: string
    label?: string
    attachment?: string
    userId: number
  }) {
    return this.request('/cards', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateCard(id: number, data: {
    listId?: number
    title: string
    description?: string
    date?: string
    label?: string
    attachment?: string
    categoryId?: number
    topics?: string[]
    tagIds?: number[]
  }) {
    return this.request(`/cards/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteCard(id: number) {
    return this.request(`/cards/${id}`, {
      method: 'DELETE',
    })
  }

  async moveCard(id: number, listId: number) {
    return this.request(`/cards/${id}/move`, {
      method: 'PATCH',
      body: JSON.stringify({ listId }),
    })
  }

  async updateCardsOrder(orders: {id: number, order: number, listId: number}[]) {
    return this.request('/cards', {
      method: 'PATCH',
      body: JSON.stringify({ orders }),
    })
  }

  async updateCardTags(id: number, tagIds: number[]) {
    return this.request(`/cards/${id}/tags`, {
      method: 'PUT',
      body: JSON.stringify({ tagIds }),
    })
  }
}

// Instância padrão do cliente API
export const apiClient = new ApiClient()

// Funções de conveniência
export const api = {
  auth: {
    login: (username: string, password: string) => apiClient.login(username, password),
    register: (username: string, password: string) => apiClient.register(username, password),
  },
  lists: {
    getAll: () => apiClient.getLists(),
    create: (name: string) => apiClient.createList(name),
    update: (id: number, name: string) => apiClient.updateList(id, name),
    delete: (id: number) => apiClient.deleteList(id),
    updateOrder: (orders: {id: number, order: number}[]) => apiClient.updateListsOrder(orders),
  },
  cards: {
    getAll: () => apiClient.getCards(),
    create: (data: any) => apiClient.createCard(data),
    update: (id: number, data: any) => apiClient.updateCard(id, data),
    delete: (id: number) => apiClient.deleteCard(id),
    move: (id: number, listId: number) => apiClient.moveCard(id, listId),
    updateOrder: (orders: {id: number, order: number, listId: number}[]) => apiClient.updateCardsOrder(orders),
    updateTags: (id: number, tagIds: number[]) => apiClient.updateCardTags(id, tagIds),
  },
} 