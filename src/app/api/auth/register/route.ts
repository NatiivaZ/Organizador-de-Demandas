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

    // Verificar se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { username }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Usuário já existe' },
        { status: 409 }
      )
    }

    // Criar novo usuário
    const user = await prisma.user.create({
      data: {
        username,
        password // Em produção, deve-se usar hash da senha
      }
    })

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Erro no registro:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 