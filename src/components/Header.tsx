'use client'

import { useAuth } from '@/lib/auth-utils'
import { FiLogOut, FiUser, FiShield, FiSettings } from 'react-icons/fi'
import { useState } from 'react'

interface HeaderProps {
  title?: string
  showUserInfo?: boolean
  showLogout?: boolean
  children?: React.ReactNode
}

export default function Header({ 
  title = "Sistema de Demandas", 
  showUserInfo = true, 
  showLogout = true,
  children 
}: HeaderProps) {
  const { user, logout, hasPermission } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-500'
      case 'MODERATOR': return 'bg-yellow-500'
      case 'USER': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'Administrador'
      case 'MODERATOR': return 'Moderador'
      case 'USER': return 'Usuário'
      default: return role
    }
  }

  return (
    <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo e Título */}
          <div className="flex items-center space-x-4">
            <div className="bg-purple-500/20 p-2 rounded-lg">
              <FiShield className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{title}</h1>
              <p className="text-sm text-gray-400">Sistema de Gerenciamento</p>
            </div>
          </div>

          {/* Conteúdo customizado */}
          {children && (
            <div className="flex-1 flex justify-center">
              {children}
            </div>
          )}

          {/* Informações do usuário e logout */}
          {showUserInfo && user && (
            <div className="flex items-center space-x-4">
              {/* Informações do usuário */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg px-3 py-2 transition-colors"
                >
                  <div className="bg-purple-500/20 p-2 rounded-full">
                    <FiUser className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-white font-medium">{user.username}</div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium text-white ${getRoleColor(user.role)}`}>
                        {getRoleLabel(user.role)}
                      </span>
                      <span className="text-xs text-gray-400">
                        Nível {user.accessLevel}
                      </span>
                    </div>
                  </div>
                </button>

                {/* Menu dropdown do usuário */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-slate-800 rounded-lg shadow-xl border border-slate-700 z-50">
                    <div className="p-4 border-b border-slate-700">
                      <div className="text-white font-medium">{user.username}</div>
                      <div className="text-sm text-gray-400">
                        {getRoleLabel(user.role)} - Nível {user.accessLevel}
                      </div>
                    </div>
                    
                    <div className="p-2">
                      {hasPermission('MODERATOR') && (
                        <a
                          href="/admin"
                          className="flex items-center space-x-2 w-full text-left px-3 py-2 text-gray-300 hover:bg-slate-700 rounded-lg transition-colors"
                        >
                          <FiSettings className="w-4 h-4" />
                          <span>Painel Admin</span>
                        </a>
                      )}
                      
                      {showLogout && (
                        <button
                          onClick={() => {
                            setShowUserMenu(false)
                            logout()
                          }}
                          className="flex items-center space-x-2 w-full text-left px-3 py-2 text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
                        >
                          <FiLogOut className="w-4 h-4" />
                          <span>Sair</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
} 