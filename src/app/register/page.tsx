"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api-utils"

export default function RegisterPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    if (!username || !password) {
      setError("Preencha usuário e senha!")
      return
    }
    setLoading(true)
    try {
      await api.auth.register(username, password)
      setSuccess("Cadastro realizado! Redirecionando...")
      setTimeout(() => router.push("/login"), 1500)
    } catch (err: any) {
      setError(err.message || "Erro ao cadastrar")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
      <div className="flex flex-col items-center mb-6">
        <img src="/logo.png" alt="Logo" className="h-16 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Crie sua conta</h1>
        <span className="bg-blue-700 text-white px-2 py-1 rounded text-sm text-center mb-2">
          Um ecossistema criativo, colaborativo com<br/>aventuras ilimitadas.
        </span>
      </div>
      <form onSubmit={handleRegister} className="w-full max-w-sm bg-[#111] rounded-lg p-8 shadow-lg flex flex-col gap-4">
        <div>
          <label className="block font-bold text-white mb-1">Nome de usuário</label>
          <input
            type="text"
            className="w-full px-3 py-2 rounded bg-black border border-neutral-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-700"
            value={username}
            onChange={e => setUsername(e.target.value)}
            autoFocus
          />
        </div>
        <div>
          <label className="block font-bold text-white mb-1">Senha</label>
          <input
            type="password"
            className="w-full px-3 py-2 rounded bg-black border border-neutral-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-700"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        {success && <div className="text-green-500 text-sm">{success}</div>}
        <button
          type="submit"
          className="w-full bg-violet-700 text-white py-2 rounded font-semibold flex items-center justify-center gap-2 hover:bg-violet-900 transition"
          disabled={loading}
        >
          {loading ? "Cadastrando..." : "Cadastrar"}
        </button>
        <div className="mt-6 bg-neutral-900 rounded p-4 text-center">
          <div className="text-white font-semibold text-sm mb-1">Já tem uma conta?</div>
          <a href="/login" className="text-violet-400 hover:underline text-sm">Entrar</a>
        </div>
      </form>
    </div>
  )
} 