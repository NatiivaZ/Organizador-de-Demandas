import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Usuário e senha são obrigatórios' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findFirst({
      where: {
        username,
        password // Em produção, deve-se usar hash da senha
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário ou senha inválidos' },
        { status: 401 }
      )
    }

    // Em produção, deve-se implementar JWT ou session
    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username
      }
    })
  } catch (error) {
    console.error('Erro no login:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 