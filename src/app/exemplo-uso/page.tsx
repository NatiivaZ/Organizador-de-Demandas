'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api-utils'
import { List } from '@/types/api'

export default function ExemploUso() {
  const [lists, setLists] = useState<List[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState<string | null>(null)

  // Exemplo de login
  const handleLogin = async () => {
    setLoginError(null)
    if (!username || !password) {
      setLoginError('Preencha usuário e senha!')
      return
    }
    try {
      const response = await api.auth.login(username, password)
      console.log('Login realizado:', response)
    } catch (error: any) {
      setLoginError(error.message || 'Erro no login')
      console.error('Erro no login:', error)
    }
  }

  // Exemplo de registro
  const handleRegister = async () => {
    try {
      const response = await api.auth.register('novo_usuario', 'senha123')
      console.log('Usuário registrado:', response)
    } catch (error) {
      console.error('Erro no registro:', error)
    }
  }

  // Carregar listas
  const loadLists = async () => {
    try {
      setLoading(true)
      const data = await api.lists.getAll()
      setLists(data as List[])
      setError(null)
    } catch (error) {
      setError('Erro ao carregar listas')
      console.error('Erro:', error)
    } finally {
      setLoading(false)
    }
  }

  // Criar nova lista
  const handleCreateList = async () => {
    try {
      const newList = await api.lists.create('Nova Lista')
      console.log('Lista criada:', newList)
      loadLists() // Recarregar listas
    } catch (error) {
      console.error('Erro ao criar lista:', error)
    }
  }

  // Criar novo cartão
  const handleCreateCard = async (listId: number) => {
    try {
      const newCard = await api.cards.create({
        listId,
        title: 'Novo Cartão',
        description: 'Descrição do cartão',
        userId: 1 // ID do usuário logado
      })
      console.log('Cartão criado:', newCard)
      loadLists() // Recarregar listas
    } catch (error) {
      console.error('Erro ao criar cartão:', error)
    }
  }

  // Mover cartão
  const handleMoveCard = async (cardId: number, newListId: number) => {
    try {
      const movedCard = await api.cards.move(cardId, newListId)
      console.log('Cartão movido:', movedCard)
      loadLists() // Recarregar listas
    } catch (error) {
      console.error('Erro ao mover cartão:', error)
    }
  }

  // Deletar cartão
  const handleDeleteCard = async (cardId: number) => {
    try {
      await api.cards.delete(cardId)
      console.log('Cartão deletado')
      loadLists() // Recarregar listas
    } catch (error) {
      console.error('Erro ao deletar cartão:', error)
    }
  }

  useEffect(() => {
    loadLists()
  }, [])

  if (loading) {
    return <div className="p-4">Carregando...</div>
  }

  if (error) {
    return <div className="p-4 text-red-500">Erro: {error}</div>
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Exemplo de Uso das APIs</h1>
      <div className="mb-6 space-y-2">
        <div className="flex items-center gap-2 mb-2">
          <input
            type="text"
            placeholder="Usuário"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="border px-2 py-1 rounded"
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="border px-2 py-1 rounded"
          />
          <button
            onClick={handleLogin}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Testar Login
          </button>
        </div>
        {loginError && <div className="text-red-500 text-sm mb-2">{loginError}</div>}
        <button
          onClick={handleRegister}
          className="bg-green-500 text-white px-4 py-2 rounded mr-2"
        >
          Testar Registro
        </button>
        <button
          onClick={handleCreateList}
          className="bg-purple-500 text-white px-4 py-2 rounded"
        >
          Criar Nova Lista
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {lists.map((list) => (
          <div key={list.id} className="border rounded-lg p-4 bg-gray-50">
            <h3 className="font-semibold text-lg mb-2">{list.name}</h3>
            <p className="text-sm text-gray-600 mb-3">
              {list.cards.length} cartões
            </p>
            
            <button
              onClick={() => handleCreateCard(list.id)}
              className="bg-blue-500 text-white px-3 py-1 rounded text-sm mb-3"
            >
              Adicionar Cartão
            </button>

            <div className="space-y-2">
              {list.cards.map((card) => (
                <div key={card.id} className="bg-white p-3 rounded border">
                  <h4 className="font-medium">{card.title}</h4>
                  {card.description && (
                    <p className="text-sm text-gray-600 mt-1">
                      {card.description}
                    </p>
                  )}
                  {card.user && (
                    <p className="text-xs text-gray-500 mt-1">
                      Por: {card.user.username}
                    </p>
                  )}
                  
                  <div className="mt-2 space-x-1">
                    <button
                      onClick={() => handleDeleteCard(card.id)}
                      className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                    >
                      Deletar
                    </button>
                    {lists.length > 1 && (
                      <select
                        onChange={(e) => handleMoveCard(card.id, parseInt(e.target.value))}
                        className="text-xs border rounded px-1"
                      >
                        <option value="">Mover para...</option>
                        {lists
                          .filter((l) => l.id !== list.id)
                          .map((l) => (
                            <option key={l.id} value={l.id}>
                              {l.name}
                            </option>
                          ))}
                      </select>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 