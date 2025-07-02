"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api-utils"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!username || !password) {
      setError("Preencha usuário e senha!")
      return
    }
    setLoading(true)
    try {
      const res = await api.auth.login(username, password) as any
      // Salva no cookie (simples, para exemplo)
      document.cookie = `user=${encodeURIComponent(JSON.stringify(res.user))}; path=/`
      router.push("/")
    } catch (err: any) {
      setError(err.message || "Erro ao logar")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
      <div className="flex flex-col items-center mb-6">
        <img src="/logo.png" alt="Logo" className="h-16 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Bem vindo à Staily</h1>
        <span className="bg-blue-700 text-white px-2 py-1 rounded text-sm text-center mb-2">
          Um ecossistema criativo, colaborativo com<br/>aventuras ilimitadas.
        </span>
      </div>
      <form onSubmit={handleLogin} className="w-full max-w-sm bg-[#111] rounded-lg p-8 shadow-lg flex flex-col gap-4">
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
        <div className="text-right text-sm mb-2">
          <a href="#" className="text-blue-400 hover:underline">Esqueci minha senha</a>
        </div>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <button
          type="submit"
          className="w-full bg-transparent border border-violet-500 text-violet-200 py-2 rounded font-semibold flex items-center justify-center gap-2 hover:bg-violet-900 transition"
          disabled={loading}
        >
          <span className="material-icons">login</span>
          {loading ? "Entrando..." : "Entrar"}
        </button>
        <div className="flex items-center gap-2 my-2">
          <div className="flex-1 h-px bg-neutral-700" />
          <span className="text-neutral-400 text-xs">Ou se preferir</span>
          <div className="flex-1 h-px bg-neutral-700" />
        </div>
        <button
          type="button"
          className="w-full bg-neutral-900 border border-neutral-700 text-white py-2 rounded flex items-center justify-center gap-2 hover:bg-neutral-800 transition"
          disabled
        >
          <span className="material-icons">alternate_email</span>
          Entre com Discord
        </button>
        <div className="mt-6 bg-neutral-900 rounded p-4 text-center">
          <div className="text-white font-semibold text-sm mb-1">Não tem uma conta?</div>
          <a href="/register" className="text-violet-400 hover:underline text-sm">Cadastre-se agora gratuitamente</a>
        </div>
      </form>
    </div>
  )
} 