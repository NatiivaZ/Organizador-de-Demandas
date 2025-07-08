'use client'

import { useState, useEffect } from 'react'
import { FiUsers, FiList, FiShield, FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi'
import { useUsers } from '@/lib/user-context'
import Header from '@/components/Header'

interface AdminUser {
  id: number
  username: string
  role: 'USER' | 'ADMIN' | 'MODERATOR'
  accessLevel: number
  createdAt?: string
  updatedAt?: string
  listPermissions?: {
    id: number
    canView: boolean
    canEdit: boolean
    canDelete: boolean
    list: {
      id: number
      name: string
    }
  }[]
}

interface List {
  id: number
  name: string
  order: number
  requiredAccessLevel: number
  isPublic: boolean
  createdAt: string
  updatedAt: string
  permissions: {
    id: number
    canView: boolean
    canEdit: boolean
    canDelete: boolean
    user: {
      id: number
      username: string
      role: string
      accessLevel: number
    }
  }[]
  _count: {
    cards: number
  }
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'users' | 'lists' | 'permissions'>('users')
  const [lists, setLists] = useState<List[]>([])
  const [loading, setLoading] = useState(true)
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [editingList, setEditingList] = useState<List | null>(null)
  const [showPermissionModal, setShowPermissionModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [selectedList, setSelectedList] = useState<List | null>(null)
  const [showCreateUserModal, setShowCreateUserModal] = useState(false)
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    role: 'USER' as const,
    accessLevel: 1
  })

  // Usar o contexto de usuários
  const { users, createUser, updateUser, deleteUser, updateAuthCookie } = useUsers()

  const accessLevels = [
    { value: 1, label: 'Básico', color: 'bg-gray-500' },
    { value: 2, label: 'Intermediário', color: 'bg-blue-500' },
    { value: 3, label: 'Avançado', color: 'bg-purple-500' }
  ]

  const roles = [
    { value: 'USER', label: 'Usuário', color: 'bg-green-500' },
    { value: 'MODERATOR', label: 'Moderador', color: 'bg-yellow-500' },
    { value: 'ADMIN', label: 'Administrador', color: 'bg-red-500' }
  ]

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const listsRes = await fetch('/api/admin/lists')
      if (listsRes.ok) {
        const listsData = await listsRes.json()
        setLists(listsData)
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdateUser(userId: number, updates: { role?: 'USER' | 'ADMIN' | 'MODERATOR'; accessLevel?: number }) {
    try {
      const updatedUser = await updateUser(userId, updates)
      const currentUserCookie = getCurrentUserFromCookie()
      if (currentUserCookie && currentUserCookie.id === userId) {
        updateAuthCookie(updatedUser)
      }
      setEditingUser(null)
      alert('Usuário atualizado com sucesso!')
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error)
      alert('Erro ao atualizar usuário')
    }
  }

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

  async function updateList(listId: number, updates: { requiredAccessLevel?: number; isPublic?: boolean }) {
    try {
      const response = await fetch('/api/admin/lists', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listId, ...updates })
      })
      if (response.ok) {
        await loadData()
        setEditingList(null)
      }
    } catch (error) {
      console.error('Erro ao atualizar lista:', error)
    }
  }

  async function updatePermission(userId: number, listId: number, permissions: { canView?: boolean; canEdit?: boolean; canDelete?: boolean }) {
    try {
      const response = await fetch('/api/admin/permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, listId, ...permissions })
      })
      if (response.ok) {
        await loadData()
      }
    } catch (error) {
      console.error('Erro ao atualizar permissão:', error)
    }
  }

  async function removePermission(userId: number, listId: number) {
    try {
      const response = await fetch(`/api/admin/permissions?userId=${userId}&listId=${listId}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        await loadData()
      }
    } catch (error) {
      console.error('Erro ao remover permissão:', error)
    }
  }

  async function handleCreateUser() {
    try {
      await createUser(newUser)
      setShowCreateUserModal(false)
      setNewUser({
        username: '',
        password: '',
        role: 'USER',
        accessLevel: 1
      })
    } catch (error) {
      console.error('Erro ao criar usuário:', error)
      alert('Erro ao criar usuário')
    }
  }

  async function handleDeleteUser(userId: number) {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return
    try {
      await deleteUser(userId)
    } catch (error) {
      console.error('Erro ao excluir usuário:', error)
      alert('Erro ao excluir usuário')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header title="Painel de Administração">
        <a
          href="/"
          className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          ← Voltar ao Sistema
        </a>
      </Header>
      <div className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex space-x-1 mb-8">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'users'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <FiUsers /> Usuários
          </button>
          <button
            onClick={() => setActiveTab('lists')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'lists'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <FiList /> Listas
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'permissions'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <FiShield /> Permissões
          </button>
        </div>

        {/* Conteúdo das Tabs */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Estatísticas de Usuários */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-gray-400 text-sm">Total de Usuários</div>
                <div className="text-2xl font-bold text-white">{users.length}</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-gray-400 text-sm">Administradores</div>
                <div className="text-2xl font-bold text-red-400">
                  {users.filter(u => u.role === 'ADMIN').length}
                </div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-gray-400 text-sm">Moderadores</div>
                <div className="text-2xl font-bold text-yellow-400">
                  {users.filter(u => u.role === 'MODERATOR').length}
                </div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-gray-400 text-sm">Usuários</div>
                <div className="text-2xl font-bold text-green-400">
                  {users.filter(u => u.role === 'USER').length}
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Gerenciar Usuários</h2>
                <button
                  onClick={() => setShowCreateUserModal(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <FiPlus /> Novo Usuário
                </button>
              </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="pb-3 text-gray-300">Usuário</th>
                    <th className="pb-3 text-gray-300">Role</th>
                    <th className="pb-3 text-gray-300">Nível de Acesso</th>
                    <th className="pb-3 text-gray-300">Criado em</th>
                    <th className="pb-3 text-gray-300">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-gray-700">
                      <td className="py-4 text-white">{user.username}</td>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium text-white ${
                          roles.find(r => r.value === user.role)?.color || 'bg-gray-500'
                        }`}>
                          {roles.find(r => r.value === user.role)?.label || user.role}
                        </span>
                      </td>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium text-white ${
                          accessLevels.find(a => a.value === user.accessLevel)?.color || 'bg-gray-500'
                        }`}>
                          {accessLevels.find(a => a.value === user.accessLevel)?.label || `Nível ${user.accessLevel}`}
                        </span>
                      </td>
                      <td className="py-4 text-gray-300">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : 'N/A'}
                      </td>
                      <td className="py-4">
                        <button
                          onClick={() => setEditingUser(user)}
                          className="text-blue-400 hover:text-blue-300 mr-3"
                          title="Editar usuário"
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-400 hover:text-red-300"
                          title="Excluir usuário"
                        >
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </div>
          </div>
        )}
        {activeTab === 'lists' && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Gerenciar Listas</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="pb-3 text-gray-300">Nome</th>
                    <th className="pb-3 text-gray-300">Nível Mínimo</th>
                    <th className="pb-3 text-gray-300">Visibilidade</th>
                    <th className="pb-3 text-gray-300">Cartões</th>
                    <th className="pb-3 text-gray-300">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {lists.map((list) => (
                    <tr key={list.id} className="border-b border-gray-700">
                      <td className="py-4 text-white font-medium">{list.name}</td>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium text-white ${
                          accessLevels.find(a => a.value === list.requiredAccessLevel)?.color || 'bg-gray-500'
                        }`}>
                          {accessLevels.find(a => a.value === list.requiredAccessLevel)?.label || `Nível ${list.requiredAccessLevel}`}
                        </span>
                      </td>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium text-white ${
                          list.isPublic ? 'bg-green-500' : 'bg-red-500'
                        }`}>
                          {list.isPublic ? 'Pública' : 'Privada'}
                        </span>
                      </td>
                      <td className="py-4 text-gray-300">{list._count.cards}</td>
                      <td className="py-4">
                        <button
                          onClick={() => setEditingList(list)}
                          className="text-blue-400 hover:text-blue-300 mr-3"
                        >
                          <FiEdit2 />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {activeTab === 'permissions' && (
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Gerenciar Permissões</h2>
              <button
                onClick={() => setShowPermissionModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <FiPlus /> Nova Permissão
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {lists.map((list) => (
                <div key={list.id} className="bg-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-3">{list.name}</h3>
                  <div className="space-y-2">
                    {list.permissions.map((permission) => (
                      <div key={permission.id} className="flex items-center justify-between bg-gray-600 rounded p-3">
                        <div>
                          <div className="text-white font-medium">{permission.user.username}</div>
                          <div className="text-sm text-gray-300">
                            {permission.canView && <span className="text-green-400">Ver </span>}
                            {permission.canEdit && <span className="text-blue-400">Editar </span>}
                            {permission.canDelete && <span className="text-red-400">Excluir</span>}
                          </div>
                        </div>
                        <button
                          onClick={() => removePermission(permission.user.id, list.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    ))}
                    {list.permissions.length === 0 && (
                      <p className="text-gray-400 text-sm">Nenhuma permissão específica definida</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {/* Modais */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">Editar Usuário</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({...editingUser, role: e.target.value as any})}
                  className="w-full bg-gray-700 text-white rounded px-3 py-2"
                >
                  {roles.map(role => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nível de Acesso</label>
                <select
                  value={editingUser.accessLevel}
                  onChange={(e) => setEditingUser({...editingUser, accessLevel: parseInt(e.target.value)})}
                  className="w-full bg-gray-700 text-white rounded px-3 py-2"
                >
                  {accessLevels.map(level => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 text-gray-300 hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleUpdateUser(editingUser.id, { role: editingUser.role, accessLevel: editingUser.accessLevel })}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
      
      {editingList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">Editar Lista</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nível Mínimo de Acesso</label>
                <select
                  value={editingList.requiredAccessLevel}
                  onChange={(e) => setEditingList({...editingList, requiredAccessLevel: parseInt(e.target.value)})}
                  className="w-full bg-gray-700 text-white rounded px-3 py-2"
                >
                  {accessLevels.map(level => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="flex items-center gap-2 text-gray-300">
                  <input
                    type="checkbox"
                    checked={editingList.isPublic}
                    onChange={(e) => setEditingList({...editingList, isPublic: e.target.checked})}
                    className="rounded"
                  />
                  Lista pública (visível para todos os usuários com nível suficiente)
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setEditingList(null)}
                className="px-4 py-2 text-gray-300 hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={() => updateList(editingList.id, { requiredAccessLevel: editingList.requiredAccessLevel, isPublic: editingList.isPublic })}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
      
      {showPermissionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">Nova Permissão</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Usuário</label>
                <select
                  value={selectedUser?.id || ''}
                  onChange={(e) => setSelectedUser(users.find(u => u.id === parseInt(e.target.value)) || null)}
                  className="w-full bg-gray-700 text-white rounded px-3 py-2"
                >
                  <option value="">Selecione um usuário</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>{user.username}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Lista</label>
                <select
                  value={selectedList?.id || ''}
                  onChange={(e) => setSelectedList(lists.find(l => l.id === parseInt(e.target.value)) || null)}
                  className="w-full bg-gray-700 text-white rounded px-3 py-2"
                >
                  <option value="">Selecione uma lista</option>
                  {lists.map(list => (
                    <option key={list.id} value={list.id}>{list.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  setShowPermissionModal(false)
                  setSelectedUser(null)
                  setSelectedList(null)
                }}
                className="px-4 py-2 text-gray-300 hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (selectedUser && selectedList) {
                    updatePermission(selectedUser.id, selectedList.id, { canView: true })
                    setShowPermissionModal(false)
                    setSelectedUser(null)
                    setSelectedList(null)
                  }
                }}
                disabled={!selectedUser || !selectedList}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50"
              >
                Criar
              </button>
            </div>
          </div>
        </div>
      )}
      
      {showCreateUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">Novo Usuário</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nome de Usuário</label>
                <input
                  type="text"
                  value={newUser.username}
                  onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                  className="w-full bg-gray-700 text-white rounded px-3 py-2"
                  placeholder="Digite o nome de usuário"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Senha</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  className="w-full bg-gray-700 text-white rounded px-3 py-2"
                  placeholder="Digite a senha"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value as any})}
                  className="w-full bg-gray-700 text-white rounded px-3 py-2"
                >
                  {roles.map(role => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nível de Acesso</label>
                <select
                  value={newUser.accessLevel}
                  onChange={(e) => setNewUser({...newUser, accessLevel: parseInt(e.target.value)})}
                  className="w-full bg-gray-700 text-white rounded px-3 py-2"
                >
                  {accessLevels.map(level => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  setShowCreateUserModal(false)
                  setNewUser({
                    username: '',
                    password: '',
                    role: 'USER',
                    accessLevel: 1
                  })
                }}
                className="px-4 py-2 text-gray-300 hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateUser}
                disabled={!newUser.username || !newUser.password}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded disabled:opacity-50"
              >
                Criar Usuário
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}