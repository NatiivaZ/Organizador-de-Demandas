'use client'

import { useEffect } from 'react'

export default function TestRedirect() {
  useEffect(() => {
    // Limpar todos os cookies
    document.cookie.split(";").forEach(function(c) { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });
    
    console.log('Cookies limpos!')
    
    // Aguardar um pouco e redirecionar
    setTimeout(() => {
      console.log('Redirecionando para página inicial...')
      window.location.href = '/'
    }, 2000)
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">Teste de Redirecionamento</h1>
        <p className="text-gray-600 mb-4">
          Limpando cookies e redirecionando para a página inicial...
        </p>
        <p className="text-sm text-gray-500">
          Se o middleware estiver funcionando, você será redirecionado para /login
        </p>
        <div className="mt-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    </div>
  )
} 