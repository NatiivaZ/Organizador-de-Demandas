'use client'

import { useEffect, useState } from 'react'

export default function DebugMiddleware() {
  const [cookieInfo, setCookieInfo] = useState<any>(null)
  
  useEffect(() => {
    // Verificar cookies no cliente
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=')
      acc[key] = value
      return acc
    }, {} as any)
    
    setCookieInfo(cookies)
  }, [])
  
  const clearCookies = () => {
    document.cookie = 'user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    window.location.reload()
  }
  
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Debug Middleware</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Status da Página</h2>
          <p className="text-green-600 font-medium">
            ✅ Esta página está sendo exibida, o que significa que o middleware permitiu acesso
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Cookies Encontrados</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
            {JSON.stringify(cookieInfo, null, 2)}
          </pre>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Ações de Teste</h2>
          <button
            onClick={clearCookies}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
          >
            Limpar Cookies e Recarregar
          </button>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
          <h3 className="font-semibold text-yellow-800 mb-2">Instruções para Teste:</h3>
          <ol className="list-decimal list-inside text-yellow-700 space-y-1">
            <li>Verifique o console do navegador (F12) para logs do middleware</li>
            <li>Verifique o terminal do servidor para logs do middleware</li>
            <li>Clique em "Limpar Cookies" para testar redirecionamento</li>
            <li>Tente acessar a página inicial (/) sem estar logado</li>
          </ol>
        </div>
      </div>
    </div>
  )
} 