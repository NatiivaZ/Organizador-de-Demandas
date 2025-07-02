"use client"

import { useState, useEffect } from "react"

interface Tag {
  id: number
  name: string
  color: string
  importance: number
}

const importanceLabels = ["Baixa", "Média", "Alta"]
const importanceColors = ["#22c55e", "#eab308", "#ef4444"]

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([])
  const [name, setName] = useState("")
  const [color, setColor] = useState("#6366f1")
  const [importance, setImportance] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadTags()
  }, [])

  async function loadTags() {
    setLoading(true)
    const res = await fetch("/api/tags")
    const data = await res.json()
    setTags(data)
    setLoading(false)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!name.trim()) {
      setError("Nome obrigatório")
      return
    }
    const res = await fetch("/api/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, color, importance })
    })
    if (!res.ok) {
      const err = await res.json()
      setError(err.error || "Erro ao criar etiqueta")
      return
    }
    setName("")
    setColor("#6366f1")
    setImportance(1)
    loadTags()
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center py-10">
      <h1 className="text-2xl font-bold mb-6">Etiquetas</h1>
      <form onSubmit={handleCreate} className="flex flex-col gap-4 bg-neutral-900 p-6 rounded-lg shadow w-full max-w-md mb-8">
        <div>
          <label className="block mb-1 font-semibold">Nome</label>
          <input
            type="text"
            className="w-full px-3 py-2 rounded bg-black border border-neutral-700 text-white"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Cor</label>
          <input
            type="color"
            className="w-12 h-8 p-0 border-none bg-transparent"
            value={color}
            onChange={e => setColor(e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Importância</label>
          <select
            className="w-full px-3 py-2 rounded bg-black border border-neutral-700 text-white"
            value={importance}
            onChange={e => setImportance(Number(e.target.value))}
          >
            <option value={1}>Baixa</option>
            <option value={2}>Média</option>
            <option value={3}>Alta</option>
          </select>
        </div>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <button
          type="submit"
          className="bg-violet-700 hover:bg-violet-800 text-white font-semibold py-2 rounded mt-2"
        >
          Criar etiqueta
        </button>
      </form>
      <div className="w-full max-w-md">
        <h2 className="text-lg font-semibold mb-3">Etiquetas criadas</h2>
        {loading ? (
          <div>Carregando...</div>
        ) : tags.length === 0 ? (
          <div className="text-neutral-400">Nenhuma etiqueta criada ainda.</div>
        ) : (
          <ul className="space-y-2">
            {tags.map(tag => (
              <li key={tag.id} className="flex items-center gap-3 bg-neutral-800 rounded px-4 py-2">
                <span
                  className="inline-block w-6 h-6 rounded-full border-2 border-white"
                  style={{ background: tag.color }}
                  title={tag.color}
                />
                <span className="font-semibold text-white">{tag.name}</span>
                <span
                  className="ml-auto px-2 py-1 rounded text-xs font-bold"
                  style={{ background: importanceColors[(tag.importance ?? 1) - 1], color: '#fff' }}
                >
                  {importanceLabels[(tag.importance ?? 1) - 1]}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
} 