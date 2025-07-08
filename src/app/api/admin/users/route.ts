import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Listar todos os usuários
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        role: true,
        accessLevel: true,
        createdAt: true,
        updatedAt: true,
        listPermissions: {
          include: {
            list: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(users)
  } catch (error) {
    console.error('Erro ao buscar usuários:', error)
    return NextResponse.json({ error: 'Erro ao buscar usuários' }, { status: 500 })
  }
}

// POST - Criar novo usuário
export async function POST(request: NextRequest) {
  try {
    const { username, password, role, accessLevel } = await request.json()
    
    if (!username || !password) {
      return NextResponse.json({ error: 'Username e senha são obrigatórios' }, { status: 400 })
    }

    // Verificar se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { username }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'Usuário já existe' }, { status: 400 })
    }

    // Criar usuário (em produção, hash a senha)
    const user = await prisma.user.create({
      data: {
        username,
        password, // Em produção, usar bcrypt.hash(password, 10)
        role: role || 'USER',
        accessLevel: accessLevel || 1
      },
      select: {
        id: true,
        username: true,
        role: true,
        accessLevel: true,
        createdAt: true
      }
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar usuário:', error)
    return NextResponse.json({ error: 'Erro ao criar usuário' }, { status: 500 })
  }
}

// PUT - Atualizar usuário
export async function PUT(request: NextRequest) {
  try {
    const { userId, role, accessLevel } = await request.json()
    
    if (!userId) {
      return NextResponse.json({ error: 'ID do usuário é obrigatório' }, { status: 400 })
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(role && { role }),
        ...(accessLevel && { accessLevel })
      },
      select: {
        id: true,
        username: true,
        role: true,
        accessLevel: true,
        updatedAt: true
      }
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error)
    return NextResponse.json({ error: 'Erro ao atualizar usuário' }, { status: 500 })
  }
}

// DELETE - Excluir usuário
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({ error: 'ID do usuário é obrigatório' }, { status: 400 })
    }

    await prisma.user.delete({
      where: { id: parseInt(userId) }
    })

    return NextResponse.json({ message: 'Usuário excluído com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir usuário:', error)
    return NextResponse.json({ error: 'Erro ao excluir usuário' }, { status: 500 })
  }
} 