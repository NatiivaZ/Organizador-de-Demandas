'use client'

import { useEffect, useState } from 'react'

export default function TestMiddleware() {
  const [cookieStatus, setCookieStatus] = useState<string>('')

  useEffect(() => {
    // Verificar cookies existentes
    const userCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('user='))
    
    if (userCookie) {
      try {
        const user = JSON.parse(decodeURIComponent(userCookie.split('=')[1]))
        setCookieStatus(`Cookie encontrado: ${user.username} (${user.role})`)
      } catch (error) {
        setCookieStatus('Cookie corrompido encontrado')
      }
    } else {
      setCookieStatus('Nenhum cookie encontrado')
    }
  }, [])

  const clearCookies = () => {
    document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    setCookieStatus('Cookies limpos')
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-4">Teste de Middleware</h1>
      
      <div className="space-y-4">
        <div className="bg-gray-800 p-4 rounded">
          <h2 className="font-semibold mb-2">Status do Cookie:</h2>
          <p>{cookieStatus}</p>
        </div>

        <button
          onClick={clearCookies}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white"
        >
          Limpar Cookies e Recarregar
        </button>

        <div className="bg-gray-800 p-4 rounded">
          <h2 className="font-semibold mb-2">Instruções:</h2>
          <ol className="list-decimal list-inside space-y-1">
            <li>Se você consegue ver esta página, o middleware NÃO está funcionando</li>
            <li>Clique em "Limpar Cookies" para testar</li>
            <li>Após limpar, você deveria ser redirecionado para /login</li>
            <li>Se não for redirecionado, há um problema com o middleware</li>
          </ol>
        </div>
      </div>
    </div>
  )
} 