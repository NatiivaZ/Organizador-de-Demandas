'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface User {
  id: number
  username: string
  role: 'USER' | 'ADMIN' | 'MODERATOR'
  accessLevel: number
  createdAt?: string
  updatedAt?: string
}

interface UserContextType {
  users: User[]
  currentUser: User | null
  setCurrentUser: (user: User) => void
  refreshUsers: () => Promise<void>
  createUser: (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'> & { password: string }) => Promise<User>
  updateUser: (userId: number, updates: Partial<User>) => Promise<User>
  deleteUser: (userId: number) => Promise<void>
  loading: boolean
  updateAuthCookie: (user: User) => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Carregar usuário atual do cookie IMEDIATAMENTE
  useEffect(() => {
    console.log('🚀 Iniciando UserProvider')
    
    // Primeiro, sempre parar o loading após um tempo mínimo
    const minLoadingTime = setTimeout(() => {
      console.log('⏰ Tempo mínimo de loading atingido')
      setLoading(false)
    }, 500)
    
    const userFromCookie = getCurrentUserFromCookie()
    if (userFromCookie) {
      console.log('👤 Usuário encontrado no cookie:', userFromCookie.username)
      setCurrentUser(userFromCookie)
      clearTimeout(minLoadingTime)
      setLoading(false) // Parar loading imediatamente se há usuário no cookie
    } else {
      console.log('🍪 Nenhum usuário no cookie')
    }
    
    // Carregar usuários em background
    refreshUsers()
    
    return () => {
      clearTimeout(minLoadingTime)
    }
  }, [])

  // Sincronizar currentUser com dados do contexto quando usuários são carregados
  useEffect(() => {
    if (users.length > 0 && currentUser) {
      console.log('🔄 Sincronizando currentUser com contexto')
      // Verificar se o usuário do cookie ainda existe no contexto
      const userInContext = users.find(u => u.id === currentUser.id)
      if (!userInContext) {
        console.log('❌ Usuário do cookie não existe mais no contexto')
        // Se o usuário do cookie não existe mais, limpar cookie e currentUser
        clearAuthCookie()
        setCurrentUser(null)
      } else if (userInContext.role !== currentUser.role || userInContext.accessLevel !== currentUser.accessLevel) {
        console.log('🔄 Atualizando currentUser com dados mais recentes')
        // Atualizar currentUser com dados mais recentes do contexto
        const updatedUser = {
          id: userInContext.id,
          username: userInContext.username,
          role: userInContext.role,
          accessLevel: userInContext.accessLevel,
          createdAt: userInContext.createdAt,
          updatedAt: userInContext.updatedAt
        }
        setCurrentUser(updatedUser)
        updateAuthCookie(updatedUser)
      }
    }
  }, [users.length, currentUser?.id]) // Dependências mais específicas para evitar loops

  // Função para obter usuário do cookie
  const getCurrentUserFromCookie = () => {
    if (typeof window === 'undefined') return null
    
    try {
      const userCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('user='))
      
      if (!userCookie) return null
      
      const user = JSON.parse(decodeURIComponent(userCookie.split('=')[1]))
      return user && user.id ? user : null
    } catch (error) {
      console.error('Erro ao obter usuário do cookie:', error)
      return null
    }
  }

  // Função para limpar cookie de autenticação
  const clearAuthCookie = () => {
    if (typeof window !== 'undefined') {
      document.cookie = 'user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    }
  }

  // Função para atualizar cookie de autenticação
  const updateAuthCookie = (user: User) => {
    if (typeof window !== 'undefined') {
      const userData = {
        id: user.id,
        username: user.username,
        role: user.role,
        accessLevel: user.accessLevel
      }
      const expires = new Date()
      expires.setTime(expires.getTime() + (7 * 24 * 60 * 60 * 1000)) // 7 dias
      document.cookie = `user=${encodeURIComponent(JSON.stringify(userData))}; expires=${expires.toUTCString()}; path=/; SameSite=Strict`
    }
  }

  // Função para atualizar lista de usuários (em background)
  const refreshUsers = async () => {
    try {
      console.log('🔄 Iniciando refreshUsers - currentUser:', currentUser?.username || 'null')
      
      // Primeiro tentar carregar usuários existentes
      let response = await fetch('/api/admin/users')
      let usersData = []
      
      if (response.ok) {
        usersData = await response.json()
      }
      
      // Se não há usuários, criar os usuários iniciais
      if (usersData.length === 0) {
        console.log('Nenhum usuário encontrado, criando usuários iniciais...')
        const initResponse = await fetch('/api/init-users', { method: 'POST' })
        if (initResponse.ok) {
          // Recarregar usuários após criação
          response = await fetch('/api/admin/users')
          if (response.ok) {
            usersData = await response.json()
          }
        }
      }
      
      setUsers(usersData)
      console.log('✅ Usuários carregados no contexto:', usersData.length)
    } catch (error) {
      console.error('❌ Erro ao carregar usuários:', error)
    }
  }

  // Função para criar usuário
  const createUser = async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'> & { password: string }): Promise<User> => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao criar usuário')
      }
      
      const newUser = await response.json()
      
      // Atualizar lista local imediatamente
      setUsers(prev => [...prev, newUser])
      
      // Disparar evento customizado para outras páginas
      window.dispatchEvent(new CustomEvent('userCreated', { detail: newUser }))
      
      return newUser
    } catch (error) {
      console.error('Erro ao criar usuário:', error)
      throw error
    }
  }

  // Função para atualizar usuário
  const updateUser = async (userId: number, updates: Partial<User>): Promise<User> => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...updates })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao atualizar usuário')
      }
      
      const updatedUser = await response.json()
      
      // Atualizar lista local imediatamente
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updatedUser } : u))
      
      // Atualizar current user se for o mesmo
      if (currentUser?.id === userId) {
        setCurrentUser(prev => prev ? { ...prev, ...updatedUser } : null)
      }
      
      // Disparar evento customizado para outras páginas
      window.dispatchEvent(new CustomEvent('userUpdated', { detail: updatedUser }))
      
      return updatedUser
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error)
      throw error
    }
  }

  // Função para excluir usuário
  const deleteUser = async (userId: number): Promise<void> => {
    try {
      const response = await fetch(`/api/admin/users?userId=${userId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao excluir usuário')
      }
      
      // Remover da lista local imediatamente
      setUsers(prev => prev.filter(u => u.id !== userId))
      
      // Se o usuário excluído era o atual, trocar para admin
      if (currentUser?.id === userId) {
        const admin = users.find(u => u.role === 'ADMIN' && u.id !== userId)
        setCurrentUser(admin || null)
      }
      
      // Disparar evento customizado para outras páginas
      window.dispatchEvent(new CustomEvent('userDeleted', { detail: { userId } }))
      
    } catch (error) {
      console.error('Erro ao excluir usuário:', error)
      throw error
    }
  }

  // Escutar eventos de outras páginas
  useEffect(() => {
    const handleUserCreated = (event: CustomEvent) => {
      const newUser = event.detail
      setUsers(prev => {
        if (!prev.find(u => u.id === newUser.id)) {
          return [...prev, newUser]
        }
        return prev
      })
    }

    const handleUserUpdated = (event: CustomEvent) => {
      const updatedUser = event.detail
      setUsers(prev => prev.map(u => u.id === updatedUser.id ? { ...u, ...updatedUser } : u))
      
      if (currentUser?.id === updatedUser.id) {
        setCurrentUser(prev => prev ? { ...prev, ...updatedUser } : null)
      }
    }

    const handleUserDeleted = (event: CustomEvent) => {
      const { userId } = event.detail
      setUsers(prev => prev.filter(u => u.id !== userId))
      
      if (currentUser?.id === userId) {
        const admin = users.find(u => u.role === 'ADMIN' && u.id !== userId)
        setCurrentUser(admin || null)
      }
    }

    window.addEventListener('userCreated', handleUserCreated as EventListener)
    window.addEventListener('userUpdated', handleUserUpdated as EventListener)
    window.addEventListener('userDeleted', handleUserDeleted as EventListener)

    return () => {
      window.removeEventListener('userCreated', handleUserCreated as EventListener)
      window.removeEventListener('userUpdated', handleUserUpdated as EventListener)
      window.removeEventListener('userDeleted', handleUserDeleted as EventListener)
    }
  }, [currentUser, users])

  return (
    <UserContext.Provider value={{
      users,
      currentUser,
      setCurrentUser,
      refreshUsers,
      createUser,
      updateUser,
      deleteUser,
      loading,
      updateAuthCookie
    }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUsers() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUsers must be used within a UserProvider')
  }
  return context
} 