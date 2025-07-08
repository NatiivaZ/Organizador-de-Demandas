"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { api } from "@/lib/api-utils"
import { FiUser, FiLock, FiEye, FiEyeOff, FiLogIn } from "react-icons/fi"

function LoginPageContent() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Verificar se o usuário já está logado
  useEffect(() => {
    const userCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('user='))
    
    if (userCookie) {
      try {
        const user = JSON.parse(decodeURIComponent(userCookie.split('=')[1]))
        if (user && user.id) {
          const redirectUrl = searchParams.get('redirect') || '/'
          router.push(redirectUrl)
        }
      } catch (error) {
        console.error('Erro ao verificar usuário logado:', error)
      }
    }
  }, [router, searchParams])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    
    if (!username || !password) {
      setError("Preencha usuário e senha!")
      return
    }
    
    setLoading(true)
    try {
      const res = await api.auth.login(username, password) as any
      
      // Verificar se o login retornou dados válidos
      if (!res.user || !res.user.id || !res.user.username) {
        throw new Error('Dados de login inválidos')
      }
      
      // Salva no cookie com configurações de segurança
      const userData = JSON.stringify(res.user)
      const cookieValue = encodeURIComponent(userData)
      const expires = new Date()
      expires.setTime(expires.getTime() + (7 * 24 * 60 * 60 * 1000)) // 7 dias
      
      document.cookie = `user=${cookieValue}; path=/; expires=${expires.toUTCString()}; SameSite=Strict`
      
      console.log('Login successful, user data:', res.user)
      setSuccess("Login realizado com sucesso!")
      
      // Redirecionamento mais rápido - apenas 200ms
      setTimeout(() => {
        const redirectUrl = searchParams.get('redirect') || '/'
        router.push(redirectUrl)
      }, 200)
    } catch (err: any) {
      setError(err.message || "Erro ao fazer login")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-purple-500/20 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <FiLogIn className="w-8 h-8 text-purple-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Bem-vindo de volta!
          </h1>
          <p className="text-gray-400">
            Faça login para acessar o sistema
          </p>
        </div>

        {/* Form */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-slate-700/50">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nome de usuário
              </label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Digite seu nome de usuário"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Senha
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full pl-10 pr-12 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-red-400 text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-4 text-green-400 text-sm">
                {success}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <FiLogIn className="w-5 h-5" />
                  Entrar
                </>
              )}
            </button>
          </form>

          {/* Info Section */}
          <div className="mt-8 pt-6 border-t border-slate-700/50">
            <div className="text-center">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-blue-400 mb-2">Precisa de uma conta?</h3>
                <p className="text-sm text-gray-300 mb-3">
                  Apenas administradores podem criar novas contas no sistema.
                </p>
                <div className="text-xs text-gray-400 space-y-1">
                  <p>• Entre em contato com o administrador do sistema</p>
                  <p>• Solicite a criação da sua conta</p>
                  <p>• Aguarde a aprovação e configuração dos níveis de acesso</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Sistema de Demandas
          </p>
          <p className="text-gray-600 text-xs mt-1">
            Acesso seguro e controlado
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  )
} 