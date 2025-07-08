import { useRouter } from 'next/navigation'

export interface AuthUser {
  id: number
  username: string
  role: 'USER' | 'ADMIN' | 'MODERATOR'
  accessLevel: number
}

// Função para obter o usuário atual do cookie
export function getCurrentUser(): AuthUser | null {
  if (typeof window === 'undefined') return null
  
  try {
    const userCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('user='))
    
    if (!userCookie) return null
    
    const user = JSON.parse(decodeURIComponent(userCookie.split('=')[1]))
    return user && user.id ? user : null
  } catch (error) {
    console.error('Erro ao obter usuário atual:', error)
    return null
  }
}

// Função para fazer logout
export function logout() {
  if (typeof window === 'undefined') return
  
  // Remover cookie
  document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
  
  // Recarregar a página para limpar o estado
  window.location.href = '/login'
}

// Função para verificar se o usuário tem permissão
export function hasPermission(user: AuthUser | null, requiredRole: 'USER' | 'MODERATOR' | 'ADMIN'): boolean {
  if (!user) return false
  
  const roleHierarchy = {
    'USER': 1,
    'MODERATOR': 2,
    'ADMIN': 3
  }
  
  return roleHierarchy[user.role] >= roleHierarchy[requiredRole]
}

// Função para verificar se o usuário tem nível de acesso suficiente
export function hasAccessLevel(user: AuthUser | null, requiredLevel: number): boolean {
  if (!user) return false
  return user.accessLevel >= requiredLevel
}

// Hook para usar autenticação
export function useAuth() {
  const router = useRouter()
  
  const user = getCurrentUser()
  
  const handleLogout = () => {
    logout()
  }
  
  const redirectToLogin = (currentPath?: string) => {
    const loginUrl = currentPath ? `/login?redirect=${encodeURIComponent(currentPath)}` : '/login'
    router.push(loginUrl)
  }
  
  return {
    user,
    isAuthenticated: !!user,
    hasPermission: (requiredRole: 'USER' | 'MODERATOR' | 'ADMIN') => hasPermission(user, requiredRole),
    hasAccessLevel: (requiredLevel: number) => hasAccessLevel(user, requiredLevel),
    logout: handleLogout,
    redirectToLogin
  }
} 