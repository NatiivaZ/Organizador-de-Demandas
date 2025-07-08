import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Log para debug
  console.log('🔥 MIDDLEWARE EXECUTANDO - Pathname:', pathname)
  
  // Permitir apenas arquivos estáticos e API
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/') ||
    pathname.includes('.')
  ) {
    console.log('✅ Arquivo estático permitido:', pathname)
    return NextResponse.next()
  }

  // Permitir apenas /login
  if (pathname === '/login') {
    console.log('✅ Página de login permitida')
    return NextResponse.next()
  }

  // Para todas as outras páginas, verificar se está logado
  const userCookie = request.cookies.get('user')
  console.log('🍪 Cookie encontrado:', userCookie ? 'SIM' : 'NÃO')
  
  if (!userCookie || !userCookie.value) {
    console.log('🚫 BLOQUEANDO - Nenhum cookie encontrado')
    console.log('🔄 REDIRECIONANDO PARA /login')
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Tentar decodificar o cookie
  try {
    const user = JSON.parse(decodeURIComponent(userCookie.value))
    console.log('👤 Usuário encontrado:', user.username)
    
    // Verificar se tem os dados necessários
    if (!user.id || !user.username) {
      console.log('🚫 BLOQUEANDO - Dados do usuário incompletos')
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    console.log('✅ Acesso permitido para:', pathname)
    return NextResponse.next()
    
  } catch (error) {
    console.log('🚫 BLOQUEANDO - Erro ao decodificar cookie:', error)
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: [
    /*
     * Aplicar a TODAS as rotas
     */
    '/(.*)',
  ],
} 