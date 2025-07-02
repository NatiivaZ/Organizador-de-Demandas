"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { api } from "@/lib/api-utils"
import { DragDropContext, Droppable, Draggable, DropResult, DraggableProvided, DraggableStateSnapshot, DroppableProvided, DroppableStateSnapshot } from '@hello-pangea/dnd'
import dynamic from "next/dynamic"
import ReactMarkdown from "react-markdown"
import "react-markdown-editor-lite/lib/index.css"
import { FiPlus, FiClock, FiCheckSquare, FiUsers, FiPaperclip, FiX, FiSearch, FiEdit2, FiTrash2, FiArchive, FiCopy, FiMove, FiBarChart2, FiSettings } from "react-icons/fi"
import { BsThreeDots, BsThreeDotsVertical } from "react-icons/bs"
import { FaPenToSquare } from "react-icons/fa6"
import { FiChevronDown, FiChevronUp } from "react-icons/fi"

interface Tag {
  id: number
  name: string
  color: string
}
interface Category {
  id: number
  name: string
}
interface Topic {
  id: number
  title: string
  cardId: number
}
interface Card {
  id: number
  title: string
  description?: string
  listId: number
  user?: { id: number; username: string }
  category?: Category
  topics: Topic[]
  tags: { tag: Tag }[]
}
interface List {
  id: number
  name: string
  color?: string
  cards: Card[]
}

function useDropdown() {
  const [openId, setOpenId] = useState<number | null>(null)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpenId(null)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])
  return { openId, setOpenId, ref }
}

// Hook para posicionamento adaptativo do dropdown
function useAdaptiveDropdown() {
  const [openId, setOpenId] = useState<number | null>(null)
  const [position, setPosition] = useState<{[key: number]: {x: number, y: number}}>({})
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpenId(null)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const updatePosition = useCallback((listId: number, triggerElement: HTMLElement) => {
    const rect = triggerElement.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const dropdownWidth = 280
    const dropdownHeight = 500

    let x = rect.right + 8 // Posição padrão à direita do botão
    let y = rect.top

    // Se não cabe à direita, posiciona à esquerda
    if (x + dropdownWidth > viewportWidth) {
      x = rect.left - dropdownWidth - 8
    }

    // Se ainda não cabe à esquerda, centraliza
    if (x < 0) {
      x = Math.max(8, (viewportWidth - dropdownWidth) / 2)
    }

    // Se não cabe embaixo, ajusta para cima
    if (y + dropdownHeight > viewportHeight) {
      y = Math.max(8, viewportHeight - dropdownHeight - 8)
    }

    // Garante que não saia da tela
    x = Math.max(8, Math.min(x, viewportWidth - dropdownWidth - 8))
    y = Math.max(8, y)

    setPosition(prev => ({ ...prev, [listId]: {x, y} }))
  }, [])

  return { openId, setOpenId, ref, position, updatePosition }
}

const MdEditor = dynamic(() => import("react-markdown-editor-lite"), { ssr: false })

export default function KanbanPage() {
  const [lists, setLists] = useState<List[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [newCardTitle, setNewCardTitle] = useState<{ [listId: number]: string }>({})
  const [loading, setLoading] = useState(true)
  const [dragLoading, setDragLoading] = useState(false)
  const [savingTags, setSavingTags] = useState(false)
  const [saveTagsTimeout, setSaveTagsTimeout] = useState<NodeJS.Timeout | null>(null)
  const [listColors, setListColors] = useState<{[key: number]: string}>({})
  
  // Cores predefinidas para as listas
  const predefinedColors = [
    '#059669', // Verde
    '#D97706', // Laranja escuro  
    '#EA580C', // Laranja
    '#DC2626', // Vermelho
    '#7C3AED', // Roxo
    '#2563EB', // Azul
    '#0891B2', // Ciano
    '#65A30D', // Verde lima
    '#BE185D', // Rosa
    '#6B7280'  // Cinza
  ]
  const [editingListId, setEditingListId] = useState<number | null>(null)
  const [editingListName, setEditingListName] = useState<string>("")
  const listDropdown = useAdaptiveDropdown()
  const cardDropdown = useDropdown()
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)
  const [modalTags, setModalTags] = useState<number[]>([])
  const [showModal, setShowModal] = useState<string | false>(false)
  const [editingDesc, setEditingDesc] = useState(false)
  const [descValue, setDescValue] = useState("")
  const [showCreateTag, setShowCreateTag] = useState(false)
  const [newTagName, setNewTagName] = useState("")
  const [newTagColor, setNewTagColor] = useState("#4f46e5")
  const [editingTag, setEditingTag] = useState<Tag | null>(null)
  const [confirmDeleteTag, setConfirmDeleteTag] = useState<Tag | null>(null)
  const [collapsedLists, setCollapsedLists] = useState<Set<number>>(new Set())

  useEffect(() => {
    loadAll()
  }, [])

  async function loadAll() {
    setLoading(true)
    try {
      const [listsRes, tagsRes, catRes] = await Promise.all([
        api.lists.getAll(),
        fetch('/api/tags').then(r => r.json()),
        fetch('/api/categories').then(r => r.json())
      ])
      setLists(listsRes as List[])
      setTags(tagsRes)
      setCategories(catRes)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    }
    setLoading(false)
  }

  async function handleAddCard(listId: number) {
    const title = newCardTitle[listId]?.trim()
    if (!title) return
    const card = await api.cards.create({ listId, title, userId: 1 }) as Card
    setLists(prev => prev.map(l => l.id === listId ? { ...l, cards: [...l.cards, card] } : l))
    setNewCardTitle((prev) => ({ ...prev, [listId]: "" }))
  }

  async function handleAddList() {
    const newList = await api.lists.create("Nova Lista") as List
    setLists(prev => [...prev, { ...newList, cards: [] } as List])
    setEditingListId(newList.id)
    setEditingListName(newList.name)
  }

  async function handleEditListName(listId: number, name: string) {
    await api.lists.update(listId, name)
    setLists(prev => prev.map(l => l.id === listId ? { ...l, name } : l))
    setEditingListId(null)
    setEditingListName("")
  }

  async function handleDeleteList(listId: number) {
    try {
      const list = lists.find(l => l.id === listId)
      if (!list) return

      const cardCount = list.cards?.length || 0
      const message = cardCount > 0 
        ? `Tem certeza que deseja excluir esta lista? Todos os ${cardCount} cartões nela também serão removidos permanentemente.`
        : 'Tem certeza que deseja excluir esta lista?'
      
      const confirmed = window.confirm(message)
      if (!confirmed) return

      // Mostrar loading visual
      setDragLoading(true)
      
      try {
        // Primeiro excluir todos os cartões da lista
        if (cardCount > 0) {
          for (const card of list.cards) {
            await api.cards.delete(card.id)
          }
        }
        
        // Depois excluir a lista
        await api.lists.delete(listId)
        
        // Atualizar interface em tempo real
        setLists(prev => prev.filter(l => l.id !== listId))
        
        // Fechar dropdown
        listDropdown.setOpenId(null)
        
        // Mostrar mensagem de sucesso
        alert(`Lista excluída com sucesso! ${cardCount > 0 ? `${cardCount} cartões também foram removidos.` : ''}`)
        
      } catch (apiError) {
        console.error('Erro na API ao excluir lista:', apiError)
        throw apiError
      }
      
    } catch (error) {
      console.error('Erro ao excluir lista:', error)
      alert('Erro ao excluir a lista. Tente novamente.')
    } finally {
      setDragLoading(false)
    }
  }

  // Função para reordenar listas/cards localmente
  function reorder<T>(list: T[], startIndex: number, endIndex: number): T[] {
    const result = Array.from(list)
    const [removed] = result.splice(startIndex, 1)
    result.splice(endIndex, 0, removed)
    return result
  }

  // Drag and drop handler
  async function onDragEnd(result: DropResult) {
    if (!result.destination || dragLoading) return

    setDragLoading(true)
    try {
      // Mover listas
      if (result.type === 'LIST') {
        const newLists = reorder(lists, result.source.index, result.destination.index)
        setLists(newLists)
        try {
          await api.lists.updateOrder(newLists.map((l, idx) => ({ id: l.id, order: idx })))
        } catch (error) {
          console.error('Erro ao atualizar ordem das listas:', error)
          // Reverter mudança em caso de erro
          setLists(lists)
        }
        return
      }

      // Mover cards
      if (result.type === 'CARD') {
        const sourceListId = Number(result.source.droppableId)
        const destListId = Number(result.destination.droppableId)

        if (sourceListId === destListId) {
          // Mesma lista
          const list = lists.find(l => l.id === sourceListId)
          if (!list) return

          const newCards = reorder(list.cards, result.source.index, result.destination.index)
          const updatedLists = lists.map(l => l.id === sourceListId ? { ...l, cards: newCards } : l)
          setLists(updatedLists)

          try {
            await api.cards.updateOrder(newCards.map((c, idx) => ({ id: c.id, order: idx, listId: sourceListId })))
          } catch (error) {
            console.error('Erro ao atualizar ordem dos cartões:', error)
            // Reverter mudança em caso de erro
            setLists(lists)
          }
        } else {
          // Entre listas
          const sourceList = lists.find(l => l.id === sourceListId)
          const destList = lists.find(l => l.id === destListId)
          if (!sourceList || !destList) return

          const card = sourceList.cards[result.source.index]
          if (!card) return

          // Remover do source
          const newSourceCards = [...sourceList.cards]
          newSourceCards.splice(result.source.index, 1)

          // Adicionar no destino
          const movedCard = { ...card, listId: destListId }
          const newDestCards = [...destList.cards]
          newDestCards.splice(result.destination.index, 0, movedCard)

          // Atualizar listas
          const updatedLists = lists.map(l => {
            if (l.id === sourceListId) return { ...l, cards: newSourceCards }
            if (l.id === destListId) return { ...l, cards: newDestCards }
            return l
          })
          setLists(updatedLists)

          try {
            await api.cards.updateOrder([
              ...newSourceCards.map((c, idx) => ({ id: c.id, order: idx, listId: sourceListId })),
              ...newDestCards.map((c, idx) => ({ id: c.id, order: idx, listId: destListId })),
            ])
          } catch (error) {
            console.error('Erro ao mover cartão entre listas:', error)
            // Reverter mudança em caso de erro
            setLists(lists)
          }
        }
      }
    } catch (error) {
      console.error('Erro geral no drag and drop:', error)
      // Recarregar dados em caso de erro crítico
      loadAll()
    } finally {
      setDragLoading(false)
    }
  }

  async function openCardModal(card: Card) {
    setSelectedCard(card)
    setModalTags((card.tags ?? []).map(t => t.tag.id))
    setShowModal("card")
  }

  async function saveCardTags() {
    if (!selectedCard) return
    
    // Evitar múltiplas chamadas simultâneas
    if (savingTags) return
    
    try {
      setSavingTags(true)
      
      // Guardar estado original para possível rollback
      const originalTags = selectedCard.tags ?? []
      
      // Atualização otimista - atualizar UI primeiro para resposta instantânea
      const updatedTags = tags.filter(t => modalTags.includes(t.id)).map(tag => ({ tag }))
      
      // Atualizar interface imediatamente
      setLists(prev => prev.map(l => l.id === selectedCard.listId ? {
        ...l,
        cards: l.cards.map(c => c.id === selectedCard.id ? { ...c, tags: updatedTags } : c)
      } : l))

      // Atualizar o cartão selecionado
      setSelectedCard(prev => prev ? { ...prev, tags: updatedTags } : null)

      // Fechar modal de tags imediatamente para UX mais rápida
      setShowModal('card')
      
      // Cancelar timeout anterior se existir
      if (saveTagsTimeout) {
        clearTimeout(saveTagsTimeout)
      }
      
      // Debounce: aguardar 300ms antes de salvar no backend
      const timeout = setTimeout(async () => {
        try {
          await api.cards.updateTags(selectedCard.id, modalTags)
          // Sucesso - UI já está atualizada
        } catch (backendError) {
          console.error('Erro ao salvar tags no backend:', backendError)
          
          // Rollback - reverter as alterações na UI
          setLists(prev => prev.map(l => l.id === selectedCard.listId ? {
            ...l,
            cards: l.cards.map(c => c.id === selectedCard.id ? { ...c, tags: originalTags } : c)
          } : l))
          
          setSelectedCard(prev => prev ? { ...prev, tags: originalTags } : null)
          
          // Reabrir modal de tags para permitir nova tentativa
          setShowModal('tags')
          setModalTags(originalTags.map(t => t.tag.id))
          
          // Mostrar erro específico
          alert('Erro ao sincronizar as etiquetas com o servidor. As alterações foram revertidas. Tente novamente.')
        } finally {
          setSavingTags(false)
        }
      }, 100) // Reduzido para 100ms para melhor responsividade
      
      setSaveTagsTimeout(timeout)
      
    } catch (error) {
      console.error('Erro geral ao salvar tags:', error)
      alert('Erro inesperado ao salvar as etiquetas. Tente novamente.')
      setSavingTags(false)
    }
  }

  function openTagsModal(card: Card) {
    setSelectedCard(card)
    setModalTags((card.tags ?? []).map(t => t.tag.id))
    setShowModal("tags")
  }

  async function saveDescription() {
    if (!selectedCard) return
    try {
      // Atualizar no backend
      await api.cards.update(selectedCard.id, { description: descValue, title: selectedCard.title })
      
      // Atualizar na interface local
      setLists(prev => prev.map(l => l.id === selectedCard.listId ? {
        ...l,
        cards: l.cards.map(c => c.id === selectedCard.id ? { ...c, description: descValue } : c)
      } : l))
      
      // Atualizar o cartão selecionado
      setSelectedCard(prev => prev ? { ...prev, description: descValue } : null)
      
      // Sair do modo de edição
      setEditingDesc(false)
      
    } catch (error) {
      console.error('Erro ao salvar descrição:', error)
      alert('Erro ao salvar a descrição. Tente novamente.')
    }
  }

  async function createTag() {
    if (!newTagName.trim()) return
    try {
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTagName.trim(),
          color: newTagColor,
          importance: 1
        })
      })
      if (response.ok) {
        const newTag = await response.json()
        setTags(prev => [...prev, newTag])
        setNewTagName("")
        setNewTagColor("#4f46e5")
        setShowCreateTag(false)
        
        // Reabrir modal do cartão se havia um cartão selecionado
        if (selectedCard) {
          setShowModal('tags') // Reabrir dropdown de tags
        }
      }
    } catch (error) {
      console.error('Erro ao criar tag:', error)
    }
  }

  async function updateTag(tagId: number, updates: Partial<Tag>) {
    try {
      const response = await fetch(`/api/tags/${tagId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      if (response.ok) {
        const updatedTag = await response.json()
        setTags(prev => prev.map(t => t.id === tagId ? updatedTag : t))
        setEditingTag(null)
      }
    } catch (error) {
      console.error('Erro ao atualizar tag:', error)
    }
  }

  async function deleteTag(tagId: number) {
    try {
      const response = await fetch(`/api/tags/${tagId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      })
      if (response.ok) {
        setTags(prev => prev.filter(t => t.id !== tagId))
        setConfirmDeleteTag(null)
        setEditingTag(null)
        // Atualizar cartões que usavam essa tag
        setLists(prev => prev.map(l => ({
          ...l,
          cards: l.cards.map(c => ({
            ...c,
            tags: c.tags.filter(t => t.tag.id !== tagId)
          }))
        })))
      }
    } catch (error) {
      console.error('Erro ao deletar tag:', error)
    }
  }

  function toggleListCollapse(listId: number) {
    setCollapsedLists(prev => {
      const newSet = new Set(prev)
      if (newSet.has(listId)) {
        newSet.delete(listId)
      } else {
        newSet.add(listId)
      }
      return newSet
    })
  }



  // Arquivar (excluir) lista e todos os cartões - OTIMIZADO
  async function handleArchiveList(listId: number) {
    const list = lists.find(l => l.id === listId)
    if (!list) return

    // ATUALIZAÇÃO OTIMISTA: Remove da interface imediatamente
    const originalLists = lists
    setLists(prev => prev.filter(l => l.id !== listId))

    try {
      // Excluir no backend em background (os cartões serão excluídos automaticamente pelo Prisma cascade)
      await api.lists.delete(listId)
      
    } catch (error) {
      console.error('Erro ao excluir lista:', error)
      // Em caso de erro, restaura a lista na interface
      setLists(originalLists)
    }
  }

  // Arquivar (excluir) apenas todos os cartões da lista - OTIMIZADO
  async function handleArchiveAllCards(listId: number) {
    const list = lists.find(l => l.id === listId)
    if (!list || list.cards?.length === 0) return

    // ATUALIZAÇÃO OTIMISTA: Remove cartões da interface imediatamente
    const originalLists = lists
    setLists(prev => prev.map(l => l.id === listId ? { ...l, cards: [] } : l))

    try {
      // Excluir todos os cartões no backend em background
      for (const card of list.cards) {
        await api.cards.delete(card.id)
      }
      
    } catch (error) {
      console.error('Erro ao arquivar cartões:', error)
      // Em caso de erro, restaura os cartões na interface
      setLists(originalLists)
    }
  }

  // Alterar cor da lista
  function handleListColorChange(listId: number, color: string) {
    setListColors(prev => ({ ...prev, [listId]: color }))
    // Aqui você pode adicionar chamada para API se quiser persistir no backend
  }

  // Remover cor da lista
  function handleResetListColor(listId: number) {
    setListColors(prev => {
      const newColors = { ...prev }
      delete newColors[listId]
      return newColors
    })
  }

  return (
    <DragDropContext onDragEnd={dragLoading ? () => {} : onDragEnd}>
      <div
        className="min-h-screen w-full bg-cover bg-center flex flex-col"
        style={{ backgroundImage: 'url("/circuit-board.jpg")' }}
      >
        <header className="flex items-center justify-between px-8 py-4 bg-black/70 text-white">
          <div className="font-bold text-lg">Suporte Técnico de TI</div>
          <div className="flex items-center gap-2">
            <span className="bg-neutral-800 px-3 py-1 rounded text-sm">0/0</span>
            <button onClick={handleAddList} className="ml-4 bg-violet-700 px-4 py-2 rounded text-white font-semibold">+ Adicionar outra lista</button>
          </div>
        </header>
        <main className="flex-1 overflow-x-auto px-6 py-6">
          {loading ? (
            <div className="text-white text-center">Carregando...</div>
          ) : (
            <Droppable droppableId="board" direction="horizontal" type="LIST">
              {(provided) => (
                <div
                  className="flex gap-4 items-start min-h-[70vh]"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {lists.map((list, listIdx) => (
                    <Draggable draggableId={String(list.id)} index={listIdx} key={list.id}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`rounded-xl p-3 flex flex-col shadow-lg ${collapsedLists.has(list.id)
                              ? 'border-2'
                              : 'bg-black/80 border max-h-[80vh]'
                            } ${snapshot.isDragging ? 'ring-2 ring-blue-500 shadow-2xl' : ''
                            }`}
                          style={{
                            width: collapsedLists.has(list.id)
                              ? '80px'
                              : '288px',
                            height: collapsedLists.has(list.id)
                              ? `${Math.max(200, list.name.length * 20 + 120)}px`
                              : 'auto',
                            maxHeight: collapsedLists.has(list.id)
                              ? `${Math.max(200, list.name.length * 20 + 120)}px`
                              : '80vh',
                            background: listColors[list.id] 
                              ? collapsedLists.has(list.id)
                                ? `linear-gradient(180deg, ${listColors[list.id]}DD, ${listColors[list.id]}99)`
                                : `linear-gradient(135deg, ${listColors[list.id]}15, ${listColors[list.id]}05)`
                              : collapsedLists.has(list.id) && list.cards?.[0]?.tags?.[0]?.tag?.color
                                ? `linear-gradient(180deg, ${list.cards[0].tags[0].tag.color}DD, ${list.cards[0].tags[0].tag.color}99)`
                                : undefined,
                            borderColor: listColors[list.id] || (collapsedLists.has(list.id) ? 'rgba(255,255,255,0.2)' : '#404040'),
                            ...provided.draggableProps.style
                          }}
                        >
                          <div className={`transition-all duration-300 ${collapsedLists.has(list.id)
                              ? 'flex flex-col items-center justify-between h-full py-3'
                              : 'flex items-center justify-between mb-2'
                            }`}>
                            {collapsedLists.has(list.id) ? (
                              // Layout vertical para lista recolhida
                              <>
                                {/* Botões no topo */}
                                <div className="flex flex-col gap-2">
                                  <button
                                    className="flex items-center justify-center text-white/80 hover:text-white p-1.5 rounded-full bg-black/20 hover:bg-black/40 transition-all"
                                    onClick={() => toggleListCollapse(list.id)}
                                    title="Expandir lista"
                                  >
                                    <FiChevronDown className="w-4 h-4" />
                                  </button>
                                  <button
                                    className="flex items-center justify-center text-white/80 hover:text-white p-1.5 rounded-full bg-black/20 hover:bg-black/40 transition-all"
                                    onClick={(e) => {
                                      const isOpen = listDropdown.openId === list.id
                                      if (!isOpen) {
                                        listDropdown.updatePosition(list.id, e.currentTarget)
                                      }
                                      listDropdown.setOpenId(isOpen ? null : list.id)
                                    }}
                                  >
                                    <BsThreeDots className="w-4 h-4" />
                                  </button>
                                </div>

                                {/* Nome da lista vertical - centro */}
                                <div
                                  className="font-bold text-white text-sm cursor-pointer hover:underline flex-1 flex items-center justify-center text-center px-2"
                                  onClick={() => { setEditingListId(list.id); setEditingListName(list.name) }}
                                  style={{
                                    writingMode: 'vertical-rl',
                                    textOrientation: 'mixed',
                                    letterSpacing: '2px',
                                    lineHeight: '1.4',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#ffffff',
                                    textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                                    wordBreak: 'keep-all'
                                  }}
                                >
                                  {list.name}
                                </div>

                                {/* Contador de cartões na base */}
                                <div className="bg-black/40 text-white px-2 py-1.5 rounded-full text-xs font-bold min-w-[28px] text-center border border-white/20">
                                  {list.cards?.length || 0}
                                </div>
                              </>
                            ) : (
                              // Layout horizontal para lista expandida
                              <>
                                {editingListId === list.id ? (
                                  <input
                                    className="font-semibold text-white text-base truncate bg-transparent border-b border-violet-500 focus:outline-none w-40"
                                    value={editingListName}
                                    autoFocus
                                    onChange={e => setEditingListName(e.target.value)}
                                    onBlur={() => handleEditListName(list.id, editingListName)}
                                    onKeyDown={e => {
                                      if (e.key === 'Enter') handleEditListName(list.id, editingListName)
                                      if (e.key === 'Escape') { setEditingListId(null); setEditingListName(list.name) }
                                    }}
                                  />
                                ) : (
                                  <>
                                    <div
                                      className="font-semibold text-white text-base truncate cursor-pointer hover:underline flex-1 flex items-center gap-2"
                                      onClick={() => { setEditingListId(list.id); setEditingListName(list.name) }}
                                    >
                                      <span>{list.name}</span>
                                    </div>

                                  </>
                                )}
                                <div className="flex items-center gap-1 relative">
                                  {/* Botão para recolher lista */}
                                  <button
                                    className="flex items-center justify-center text-neutral-400 hover:text-white p-1 rounded transition-colors"
                                    onClick={() => toggleListCollapse(list.id)}
                                    title="Recolher lista"
                                  >
                                    <FiChevronUp className="w-4 h-4" />
                                  </button>
                                  {/* Botão de três pontos */}
                                  <button
                                    className="flex items-center justify-center text-neutral-400 hover:text-white p-1 rounded transition-colors"
                                    onClick={(e) => {
                                      const isOpen = listDropdown.openId === list.id
                                      if (!isOpen) {
                                        listDropdown.updatePosition(list.id, e.currentTarget)
                                      }
                                      listDropdown.setOpenId(isOpen ? null : list.id)
                                    }}
                                  >
                                    <BsThreeDots className="w-4 h-4" />
                                  </button>
                                </div>
                              </>
                            )}
                            {listDropdown.openId === list.id && (
                              <div 
                                ref={listDropdown.ref}
                                className="fixed z-50 bg-neutral-900 border border-neutral-700 rounded-lg shadow-xl min-w-[280px] py-2 animate-fade-in dropdown-menu"
                                style={{
                                  left: `${listDropdown.position[list.id]?.x || 0}px`,
                                  top: `${listDropdown.position[list.id]?.y || 0}px`,
                                }}
                                role="menu"
                                aria-label="Menu de ações da lista"
                                tabIndex={-1}
                              >
                                {/* Seção CRUD */}
                                <div className="px-2 py-1">
                                  <div className="text-xs text-neutral-400 px-2 py-1">Ações</div>
                                  <button
                                    className="w-full text-left px-4 py-2 text-sm text-white hover:bg-neutral-800 flex items-center gap-2 transition-colors"
                                    onClick={() => { /* handleAddCard(list.id) */ listDropdown.setOpenId(null) }}
                                    aria-label="Adicionar cartão à lista"
                                    title="Criar um novo cartão nesta lista"
                                    role="menuitem"
                                  >
                                    <FiPlus className="w-4 h-4" />
                                    Adicionar cartão
                                  </button>
                                  <button
                                    className="w-full text-left px-4 py-2 text-sm text-white hover:bg-neutral-800 flex items-center gap-2 transition-colors"
                                    onClick={() => { /* handleCopyList(list.id) */ listDropdown.setOpenId(null) }}
                                    aria-label="Copiar lista"
                                    title="Criar uma cópia desta lista"
                                    role="menuitem"
                                  >
                                    <FiCopy className="w-4 h-4" />
                                    Copiar lista
                                  </button>
                                  <button
                                    className="w-full text-left px-4 py-2 text-sm text-white hover:bg-neutral-800 flex items-center gap-2 transition-colors"
                                    onClick={() => { /* handleMoveList(list.id) */ listDropdown.setOpenId(null) }}
                                    aria-label="Mover lista"
                                    title="Mover esta lista para outra posição"
                                    role="menuitem"
                                  >
                                    <FiMove className="w-4 h-4" />
                                    Mover lista
                                  </button>
                                  <button
                                    className="w-full text-left px-4 py-2 text-sm text-white hover:bg-neutral-800 flex items-center gap-2 transition-colors"
                                    onClick={() => { /* handleArchiveList(list.id) */ listDropdown.setOpenId(null) }}
                                    aria-label="Arquivar lista"
                                    title="Arquivar esta lista"
                                    role="menuitem"
                                  >
                                    <FiArchive className="w-4 h-4" />
                                    Arquivar lista
                                  </button>
                                </div>
                                
                                {/* Separador */}
                                <div className="border-t border-neutral-700 my-1"></div>
                                
                                {/* Seção de Cores */}
                                <div className="px-2 py-1">
                                  <div className="text-xs text-neutral-400 px-2 py-1">Cores</div>
                                  <div className="px-2 py-1">
                                    {/* Cores predefinidas */}
                                    <div className="grid grid-cols-5 gap-2 mb-3">
                                      {predefinedColors.map((color, index) => (
                                        <button
                                          key={index}
                                          className={`w-8 h-6 rounded border-2 transition-all hover:scale-110 ${
                                            listColors[list.id] === color 
                                              ? 'border-white shadow-lg' 
                                              : 'border-neutral-600 hover:border-neutral-400'
                                          }`}
                                          style={{ backgroundColor: color }}
                                          onClick={() => {
                                            handleListColorChange(list.id, color)
                                            listDropdown.setOpenId(null)
                                          }}
                                          title={`Aplicar cor ${color}`}
                                          aria-label={`Aplicar cor ${color} à lista`}
                                        />
                                      ))}
                                    </div>
                                    
                                    {/* Seletor de cor personalizada */}
                                    <div className="flex items-center gap-2 mb-2">
                                      <input
                                        type="color"
                                        className="w-6 h-6 rounded border border-neutral-700 cursor-pointer transition-colors"
                                        value={listColors[list.id] || "#6366f1"}
                                        onChange={(e) => handleListColorChange(list.id, e.target.value)}
                                        aria-label="Selecionar cor personalizada"
                                        title="Escolher cor personalizada para esta lista"
                                      />
                                      <span className="text-xs text-neutral-300">Cor da lista</span>
                                    </div>
                                    
                                    {/* Botão remover cor */}
                                    <button
                                      className="w-full text-left px-2 py-1 text-xs text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors"
                                      onClick={() => {
                                        handleResetListColor(list.id)
                                        listDropdown.setOpenId(null)
                                      }}
                                      aria-label="Remover cor da lista"
                                      title="Remover cor personalizada da lista"
                                      role="menuitem"
                                    >
                                      Remover cor
                                    </button>
                                  </div>
                                </div>
                                
                                {/* Separador */}
                                <div className="border-t border-neutral-700 my-1"></div>
                                
                                {/* Seção de Automações e Ordenação */}
                                <div className="px-2 py-1">
                                  <div className="text-xs text-neutral-400 px-2 py-1">Automações</div>
                                  <button
                                    className="w-full text-left px-4 py-2 text-sm text-white hover:bg-neutral-800 flex items-center gap-2 transition-colors"
                                    onClick={() => { /* handleAutoSort(list.id) */ listDropdown.setOpenId(null) }}
                                    aria-label="Ordenar automaticamente"
                                    title="Configurar ordenação automática dos cartões"
                                    role="menuitem"
                                  >
                                    <FiBarChart2 className="w-4 h-4" />
                                    Ordenar automaticamente
                                  </button>
                                  <button
                                    className="w-full text-left px-4 py-2 text-sm text-white hover:bg-neutral-800 flex items-center gap-2 transition-colors"
                                    onClick={() => { /* handleListRules(list.id) */ listDropdown.setOpenId(null) }}
                                    aria-label="Regras da lista"
                                    title="Configurar regras e automações da lista"
                                    role="menuitem"
                                  >
                                    <FiSettings className="w-4 h-4" />
                                    Regras da lista
                                  </button>
                                </div>
                                
                                {/* Separador */}
                                <div className="border-t border-neutral-700 my-1"></div>
                                
                                {/* Separador */}
                                <div className="border-t border-neutral-700 my-1"></div>
                                
                                {/* Seção de Exclusão */}
                                <div className="px-2 py-1">
                                  <button
                                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-900/40 flex items-center gap-2 transition-colors rounded"
                                    onClick={() => {
                                      listDropdown.setOpenId(null)
                                      handleArchiveList(list.id)
                                    }}
                                    aria-label="Excluir lista"
                                    title="Excluir esta lista e todos os seus cartões permanentemente"
                                    role="menuitem"
                                  >
                                    <FiTrash2 className="w-4 h-4" />
                                    Excluir Esta Lista
                                  </button>
                                  <button
                                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-900/40 flex items-center gap-2 transition-colors rounded mt-1"
                                    onClick={() => {
                                      listDropdown.setOpenId(null)
                                      handleArchiveAllCards(list.id)
                                    }}
                                    aria-label="Excluir todos os cartões"
                                    title="Excluir todos os cartões desta lista permanentemente"
                                    role="menuitem"
                                  >
                                    <FiTrash2 className="w-4 h-4" />
                                    Excluir todos os cartões nesta lista
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                          {!collapsedLists.has(list.id) && (
                            <Droppable droppableId={String(list.id)} type="CARD">
                              {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
                                <div
                                  className={`flex-1 overflow-y-auto pr-1 custom-scrollbar transition-colors duration-200 min-h-[48px] ${snapshot.isDraggingOver ? 'bg-violet-900/30' : ''}`}
                                  ref={provided.innerRef}
                                  {...provided.droppableProps}
                                >
                                  {(list.cards ?? []).map((card, cardIdx) => (
                                    <Draggable draggableId={`card-${card.id}`} index={cardIdx} key={card.id}>
                                      {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                                        <div
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                          className={`bg-neutral-900 rounded-lg p-3 mb-3 shadow border border-neutral-800 cursor-pointer hover:bg-neutral-800 transition-colors
                                          ${snapshot.isDragging ? 'ring-2 ring-violet-500' : ''}`}
                                          style={{
                                            ...provided.draggableProps.style
                                          }}
                                          onClick={e => { if (!(e.target as HTMLElement).closest('.dropdown-menu')) openCardModal(card) }}
                                          tabIndex={0}
                                          role="button"
                                        >
                                          {/* Etiquetas */}
                                          {(card.tags ?? []).length > 0 && (
                                            <div className="flex gap-1 mb-1">
                                              {(card.tags ?? []).map((t) => (
                                                <span
                                                  key={t.tag.id}
                                                  className="inline-block w-4 h-2 rounded"
                                                  style={{ background: t.tag.color }}
                                                  title={t.tag.name}
                                                />
                                              ))}
                                            </div>
                                          )}
                                          {/* Título */}
                                          <div className="font-bold text-white text-sm mb-1 truncate">{card.title}</div>
                                          {/* Categoria */}
                                          {card.category && (
                                            <div className="text-xs text-blue-400 mb-1">{card.category.name}</div>
                                          )}
                                          {/* Tópicos */}
                                          {(card.topics ?? []).length > 0 && (
                                            <ul className="text-xs text-neutral-300 mb-1 list-disc ml-4">
                                              {(card.topics ?? []).map((topic) => (
                                                <li key={topic.id}>{topic.title}</li>
                                              ))}
                                            </ul>
                                          )}
                                          {/* Rodapé do cartão */}
                                          <div className="flex items-center gap-2 mt-2 text-xs text-neutral-500">
                                            <span className="material-icons text-base">notes</span>
                                            {card.user && <span>{card.user.username}</span>}
                                            <div className="relative ml-auto" ref={cardDropdown.ref}>
                                              <button
                                                className="flex items-center justify-center text-neutral-400 hover:text-white p-0 m-0 h-6 w-6"
                                                style={{ minWidth: 0, minHeight: 0 }}
                                                onClick={() => cardDropdown.setOpenId(cardDropdown.openId === card.id ? null : card.id)}
                                              >
                                                <span className="material-icons" style={{ fontSize: 20, lineHeight: 1 }}><FaPenToSquare /> </span>
                                              </button>
                                              {cardDropdown.openId === card.id && (
                                                <div className="absolute right-0 top-6 z-50 bg-neutral-900 border border-neutral-700 rounded shadow-lg min-w-[120px] py-1">
                                                  <button
                                                    className="w-full text-left px-4 py-2 text-sm text-white hover:bg-neutral-800"
                                                    onClick={() => { /* handleEditCard(card.id) */ cardDropdown.setOpenId(null) }}
                                                  >Editar cartão</button>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </Draggable>
                                  ))}
                                  {provided.placeholder}
                                </div>
                              )}
                            </Droppable>
                          )}

                          {/* Adicionar cartão - sempre visível */}
                          {!collapsedLists.has(list.id) && (
                            <div className="mt-2">
                              <input
                                type="text"
                                placeholder="Adicionar um cartão"
                                className="w-full px-2 py-1 rounded bg-neutral-800 text-white border border-neutral-700 text-sm mb-1"
                                value={newCardTitle[list.id] || ""}
                                onChange={e => setNewCardTitle({ ...newCardTitle, [list.id]: e.target.value })}
                                onKeyDown={e => e.key === 'Enter' && handleAddCard(list.id)}
                              />
                              <button
                                onClick={() => handleAddCard(list.id)}
                                className="w-full bg-neutral-900 border border-neutral-700 text-white py-1 rounded text-xs hover:bg-neutral-800"
                              >Adicionar um cartão</button>
                            </div>
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
        </div>
              )}
            </Droppable>
          )}
      </main>
        <footer className="flex justify-center items-center py-2 bg-black/70">
          <div className="flex gap-2">
            <button className="bg-neutral-800 p-2 rounded hover:bg-neutral-700">
              <span className="material-icons">calendar_month</span>
            </button>
            <button className="bg-neutral-800 p-2 rounded hover:bg-neutral-700">
              <span className="material-icons">view_column</span>
            </button>
            <button className="bg-neutral-800 p-2 rounded hover:bg-neutral-700">
              <span className="material-icons">view_kanban</span>
            </button>
          </div>
        </footer>
        <style jsx global>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #222;
            border-radius: 4px;
          }
          @keyframes fade-in {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-fade-in { animation: fade-in 0.2s; }
          
          /* Melhorias para drag and drop */
          [data-rbd-drag-handle-draggable-id] {
            cursor: grab !important;
          }
          [data-rbd-drag-handle-draggable-id]:active {
            cursor: grabbing !important;
          }
          
          /* Animação suave para cartões sendo arrastados */
          [data-rbd-draggable-id] {
            transition: transform 0.2s ease, box-shadow 0.2s ease !important;
          }
          
          /* Cursor personalizado durante drag */
          .react-beautiful-dnd-dragging {
            cursor: grabbing !important;
          }
          .markdown-body h1, .markdown-body h2, .markdown-body h3 { font-weight: bold; margin-top: 1em; }
          .markdown-body ul { list-style: disc; margin-left: 1.5em; }
          .markdown-body ol { list-style: decimal; margin-left: 1.5em; }
          .markdown-body code { background: #222; padding: 2px 4px; border-radius: 4px; }
          .markdown-body pre { background: #222; padding: 8px; border-radius: 6px; overflow-x: auto; }
          .dark-markdown-editor .rc-md-editor {
            background: #18181b !important;
            color: #fff !important;
            border-radius: 8px;
            border: 1px solid #27272a;
          }
          .dark-markdown-editor .rc-md-editor .rc-md-navigation {
            background: #23232b !important;
            color: #fff !important;
            border-radius: 8px 8px 0 0;
          }
          .dark-markdown-editor .rc-md-editor .section-container {
            background: #18181b !important;
            color: #fff !important;
          }
          .dark-markdown-editor .rc-md-editor textarea {
            background: #18181b !important;
            color: #fff !important;
            border-radius: 0 0 8px 8px;
          }
          .dark-markdown-editor .rc-md-editor .editor-container {
            background: #18181b !important;
            color: #fff !important;
          }
        `}</style>
        {/* Modal para criar nova tag */}
        {showCreateTag && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center">
            <div className="fixed inset-0 bg-black/80" onClick={() => setShowCreateTag(false)} />
            <div className="relative bg-neutral-900 rounded-xl p-6 w-full max-w-md mx-auto z-10 shadow-2xl border border-neutral-700">
              <h3 className="text-lg font-semibold mb-4 text-white">Criar Nova Etiqueta</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Nome</label>
                  <input
                    type="text"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newTagName.trim()) {
                        createTag()
                      }
                    }}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-white"
                    placeholder="Nome da etiqueta"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Cor</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newTagColor}
                      onChange={(e) => setNewTagColor(e.target.value)}
                      className="w-12 h-10 rounded border border-neutral-700"
                    />
                    <input
                      type="text"
                      value={newTagColor}
                      onChange={(e) => setNewTagColor(e.target.value)}
                      className="flex-1 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-white"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <button
                    onClick={() => {
                      setShowCreateTag(false)
                      // Reabrir modal do cartão se havia um cartão selecionado
                      if (selectedCard) {
                        setShowModal('tags') // Reabrir dropdown de tags
                      }
                    }}
                    className="px-4 py-2 rounded bg-neutral-700 text-white hover:bg-neutral-600 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={createTag}
                    disabled={!newTagName.trim()}
                    className={`px-4 py-2 rounded font-semibold transition-colors ${
                      !newTagName.trim() 
                        ? 'bg-neutral-600 text-neutral-400 cursor-not-allowed' 
                        : 'bg-violet-700 text-white hover:bg-violet-600'
                    }`}
                  >
                    Criar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal para editar/confirmar exclusão de tag */}
        {(editingTag || confirmDeleteTag) && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center">
            <div className="fixed inset-0 bg-black/80" onClick={() => {
              setEditingTag(null)
              setConfirmDeleteTag(null)
            }} />
            <div className="relative bg-neutral-900 rounded-xl p-6 w-full max-w-md mx-auto z-10 shadow-2xl border border-neutral-700">
              {confirmDeleteTag ? (
                // Modal de confirmação de exclusão
                <>
                  <h3 className="text-lg font-semibold mb-4 text-white">Confirmar Exclusão</h3>
                  <div className="mb-6">
                    <p className="text-neutral-300 mb-4">
                      Tem certeza que deseja excluir a etiqueta
                      <span className="font-semibold text-white"> "{confirmDeleteTag.name}"</span>?
                    </p>
                    <div className="flex items-center gap-2 p-3 bg-neutral-800 rounded">
                      <span
                        className="inline-block w-6 h-6 rounded-full border-2 border-white"
                        style={{ background: confirmDeleteTag.color }}
                      />
                      <span className="text-white">{confirmDeleteTag.name}</span>
                    </div>
                    <p className="text-sm text-neutral-400 mt-2">
                      Esta ação não pode ser desfeita. A etiqueta será removida de todos os cartões.
                    </p>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setConfirmDeleteTag(null)
                        // Volta para o modal de edição
                        if (editingTag) {
                          // Mantém o modal de edição aberto
                        }
                      }}
                      className="px-4 py-2 rounded bg-neutral-700 text-white hover:bg-neutral-600"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => deleteTag(confirmDeleteTag.id)}
                      className="px-4 py-2 rounded bg-red-700 text-white font-semibold hover:bg-red-600"
                    >
                      Excluir
                    </button>
                  </div>
                </>
              ) : editingTag ? (
                // Modal de edição
                <>
                  <h3 className="text-lg font-semibold mb-4 text-white">Editar Etiqueta</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">Nome</label>
                      <input
                        type="text"
                        value={editingTag.name}
                        onChange={(e) => setEditingTag({ ...editingTag, name: e.target.value })}
                        className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-white"
                        placeholder="Nome da etiqueta"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">Cor</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={editingTag.color}
                          onChange={(e) => setEditingTag({ ...editingTag, color: e.target.value })}
                          className="w-12 h-10 rounded border border-neutral-700"
                        />
                        <input
                          type="text"
                          value={editingTag.color}
                          onChange={(e) => setEditingTag({ ...editingTag, color: e.target.value })}
                          className="flex-1 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-white"
                        />
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-6">
                      <button
                        onClick={() => setConfirmDeleteTag(editingTag)}
                        className="flex items-center gap-2 px-4 py-2 rounded bg-red-700 text-white hover:bg-red-600"
                        title="Excluir etiqueta"
                      >
                        <FiTrash2 className="w-4 h-4" />
                        Excluir
                      </button>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            // Reverter alterações na tag
                            setEditingTag(null)
                          }}
                          className="px-4 py-2 rounded bg-neutral-700 text-white hover:bg-neutral-600 transition-colors"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => updateTag(editingTag.id, { name: editingTag.name, color: editingTag.color })}
                          className="px-4 py-2 rounded bg-violet-700 text-white font-semibold hover:bg-violet-600 transition-colors"
                        >
                          Salvar
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        )}

        {showModal && selectedCard && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/70" onClick={() => setShowModal(false)} />
            <div className="relative bg-neutral-900 rounded-xl p-8 w-full max-w-5xl mx-auto z-10 shadow-2xl flex flex-col md:flex-row animate-fade-in">
              {/* Lado esquerdo: detalhes do cartão */}
              <div className="flex-1 md:pr-8 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-neutral-800 text-white px-3 py-1 rounded text-xs font-semibold">{lists.find(l => l.id === selectedCard.listId)?.name}</span>
                </div>
                <h2 className="text-2xl font-bold mb-4 break-words">{selectedCard.title}</h2>
                {/* Etiquetas */}
                <div className="mb-4 flex flex-wrap gap-2 items-center relative">
                  {(selectedCard.tags ?? []).map(t => (
                    <span
                      key={t.tag.id}
                      className="px-3 py-1 rounded-full text-xs font-semibold shadow"
                      style={{ background: t.tag.color, color: '#fff', border: '1.5px solid #fff' }}
                    >
                      {t.tag.name}
                    </span>
                  ))}
                  <div className="relative">
                    <button
                      className="ml-2 px-2 py-1 rounded bg-neutral-800 text-white text-xs border border-neutral-700 hover:bg-neutral-700 flex items-center gap-1"
                      onClick={() => setShowModal('tags')}
                      type="button"
                    >
                      <FiPlus /> Etiquetas
                    </button>
                    {showModal === 'tags' && (
                      <TagDropdown
                        tags={tags}
                        modalTags={modalTags}
                        setModalTags={setModalTags}
                        onClose={() => setShowModal('card')}
                        onSave={async () => { await saveCardTags(); }}
                        onCreateTag={() => {
                          setShowCreateTag(true)
                          setShowModal(false) // Fechar modal do cartão
                        }}
                        onEditTag={(tag) => setEditingTag(tag)}
                        selectedCard={selectedCard}
                        savingTags={savingTags}
                      />
                    )}
                  </div>
                  {tags.length === 0 && <span className="text-xs text-neutral-400 ml-2">Nenhuma etiqueta cadastrada</span>}
                </div>
                {/* Botões estilo Trello */}
                <div className="flex gap-2 mb-6">
                  <button className="flex items-center gap-2 border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-2 rounded transition">
                    <FiPlus className="text-lg" /> Adicionar
                  </button>
                  <button className="flex items-center gap-2 border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-2 rounded transition">
                    <FiClock className="text-lg" /> Datas
                  </button>
                  <button className="flex items-center gap-2 border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-2 rounded transition">
                    <FiCheckSquare className="text-lg" /> Checklist
                  </button>
                  <button className="flex items-center gap-2 border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-2 rounded transition">
                    <FiUsers className="text-lg" /> Membros
                  </button>
                  <button className="flex items-center gap-2 border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-2 rounded transition">
                    <FiPaperclip className="text-lg" /> Anexo
                  </button>
                </div>
                {/* Descrição */}
                <div className="mb-4">
                  <div className="font-semibold mb-1 flex items-center gap-2 justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-icons text-base">notes</span>
                      Descrição
                    </div>
                    {!editingDesc && (
                      <button
                        className="text-xs text-blue-400 hover:underline"
                        onClick={() => { setEditingDesc(true); setDescValue(selectedCard.description || "") }}
                      >Editar</button>
                    )}
                  </div>
                  {editingDesc ? (
                    <form onSubmit={e => { e.preventDefault(); saveDescription() }} className="flex flex-col gap-2">
                      <MdEditor
                        value={descValue}
                        style={{ height: "320px", background: "#18181b", color: "#fff", borderRadius: 8, width: "100%" }}
                        renderHTML={text => <ReactMarkdown>{text}</ReactMarkdown>}
                        onChange={({ text }) => setDescValue(text)}
                        view={{ menu: true, md: true, html: false }}
                        placeholder="Digite a descrição em Markdown..."
                        className="dark-markdown-editor"
                      />
                      <div className="flex gap-2 justify-end">
                        <button 
                          type="button" 
                          className="px-3 py-1 rounded bg-neutral-700 text-white hover:bg-neutral-600 transition-colors" 
                          onClick={() => {
                            // Reverter alterações
                            setDescValue(selectedCard.description || "")
                            setEditingDesc(false)
                          }}
                        >
                          Cancelar
                        </button>
                        <button 
                          type="submit" 
                          className="px-3 py-1 rounded bg-violet-700 text-white font-semibold hover:bg-violet-600 transition-colors"
                        >
                          Salvar
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="bg-neutral-800 rounded p-3 text-sm text-neutral-200 whitespace-pre-line markdown-body">
                      {selectedCard.description ? <ReactMarkdown>{selectedCard.description}</ReactMarkdown> : <span className="text-neutral-500">Sem descrição</span>}
                    </div>
                  )}
                </div>
              </div>
              {/* Lado direito: comentários/atividade (placeholder) */}
              <div className="w-80 border-l border-neutral-800 pl-8 flex flex-col">
                <div className="font-semibold mb-4 text-white">Ações</div>

                {/* Botão de arquivar */}
                <button className="flex items-center gap-2 w-full bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded transition mb-3">
                  <FiArchive className="text-lg" />
                  Arquivar
                </button>

                <div className="font-semibold mb-2 text-white">Comentários e atividade</div>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded bg-neutral-800 border border-neutral-700 text-white mb-2"
                  placeholder="Escrever um comentário..."
                  disabled
                />
                <button className="bg-neutral-700 text-white px-3 py-2 rounded mb-2" disabled>Enviar</button>
                <div className="text-neutral-500 text-xs">(Em breve...)</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DragDropContext>
  )
}

// Utilitário para buscar tags e categorias
const apiClient = {
  async getTags() {
    const res = await fetch("/api/tags")
    return res.json()
  },
  async getCategories() {
    const res = await fetch("/api/categories")
    return res.json()
  }
}

type TagDropdownProps = {
  tags: Tag[];
  modalTags: number[];
  setModalTags: React.Dispatch<React.SetStateAction<number[]>>;
  onClose: () => void;
  onSave: () => void;
  onCreateTag: () => void;
  onEditTag: (tag: Tag) => void;
  selectedCard?: Card | null;
  savingTags?: boolean;
}
function TagDropdown({ tags, modalTags, setModalTags, onClose, onSave, onCreateTag, onEditTag, selectedCard, savingTags }: TagDropdownProps) {
  const [search, setSearch] = useState("")
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && e.target instanceof Node && !ref.current.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])
  const filtered = tags.filter((tag: Tag) => tag.name.toLowerCase().includes(search.toLowerCase()))
  return (
    <div ref={ref} className="absolute left-0 top-10 z-50 bg-neutral-900 border border-neutral-700 rounded-lg shadow-lg w-80 p-4 animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-white">Etiquetas</span>
        <button onClick={onClose} className="text-neutral-400 hover:text-white"><FiX /></button>
      </div>
      <div className="mb-3 flex items-center gap-2 bg-neutral-800 rounded px-2 py-1">
        <FiSearch className="text-neutral-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar etiquetas..."
          className="bg-transparent outline-none text-white flex-1 text-sm"
        />
      </div>
      <div className="flex flex-col gap-2 max-h-48 overflow-y-auto mb-3">
        {filtered.length === 0 ? (
          <span className="text-neutral-400 text-sm">Nenhuma etiqueta encontrada.</span>
        ) : filtered.map(tag => (
          <label key={tag.id} className="flex items-center gap-2 cursor-pointer bg-neutral-800 rounded px-2 py-1">
            <input
              type="checkbox"
              checked={modalTags.includes(tag.id)}
              onChange={e => setModalTags(modalTags => e.target.checked ? [...modalTags, tag.id] : modalTags.filter(id => id !== tag.id))}
            />
            <span className="inline-block w-5 h-5 rounded-full border-2 border-white" style={{ background: tag.color }} />
            <span className="flex-1 text-white text-sm">{tag.name}</span>
            <button
              onClick={() => onEditTag(tag)}
              className="text-neutral-400 hover:text-white"
            >
              <FiEdit2 size={14} />
            </button>
          </label>
        ))}
      </div>
      <button
        onClick={onCreateTag}
        className="w-full flex items-center gap-2 justify-center bg-neutral-800 hover:bg-neutral-700 text-white py-2 rounded mb-2 text-sm"
      >
        <FiPlus /> Criar uma nova etiqueta
      </button>
      <button className="w-full bg-neutral-700 hover:bg-neutral-600 text-white py-2 rounded text-xs mb-2">Habilitar o modo compatível para usuários com daltonismo</button>
      <div className="flex justify-end gap-2 mt-2">
        <button 
          onClick={() => {
            // Reverter alterações nas tags
            if (selectedCard) {
              setModalTags((selectedCard.tags ?? []).map(t => t.tag.id))
            }
            onClose()
          }} 
          className="px-4 py-2 rounded bg-neutral-700 text-white hover:bg-neutral-600 transition-colors"
        >
          Cancelar
        </button>
        <button 
          onClick={onSave} 
          disabled={savingTags}
          className={`px-4 py-2 rounded font-semibold transition-colors flex items-center gap-2 ${
            savingTags 
              ? 'bg-violet-500 text-white cursor-not-allowed' 
              : 'bg-violet-700 text-white hover:bg-violet-600'
          }`}
        >
          {savingTags ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Salvando...
            </>
          ) : (
            'Salvar'
          )}
        </button>
      </div>
    </div>
  )
}
