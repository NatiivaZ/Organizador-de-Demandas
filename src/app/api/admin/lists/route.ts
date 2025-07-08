import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Listar todas as listas com configurações de acesso
export async function GET() {
  try {
    const lists = await prisma.list.findMany({
      select: {
        id: true,
        name: true,
        order: true,
        requiredAccessLevel: true,
        isPublic: true,
        createdAt: true,
        updatedAt: true,
        permissions: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                role: true,
                accessLevel: true
              }
            }
          }
        },
        _count: {
          select: {
            cards: true
          }
        }
      },
      orderBy: { order: 'asc' }
    })
    return NextResponse.json(lists)
  } catch (error) {
    console.error('Erro ao buscar listas:', error)
    return NextResponse.json({ error: 'Erro ao buscar listas' }, { status: 500 })
  }
}

// PUT - Atualizar configurações de acesso de uma lista
export async function PUT(request: NextRequest) {
  try {
    const { listId, requiredAccessLevel, isPublic } = await request.json()
    
    if (!listId) {
      return NextResponse.json({ error: 'ID da lista é obrigatório' }, { status: 400 })
    }

    const list = await prisma.list.update({
      where: { id: listId },
      data: {
        ...(requiredAccessLevel !== undefined && { requiredAccessLevel }),
        ...(isPublic !== undefined && { isPublic })
      },
      select: {
        id: true,
        name: true,
        requiredAccessLevel: true,
        isPublic: true,
        updatedAt: true
      }
    })

    return NextResponse.json(list)
  } catch (error) {
    console.error('Erro ao atualizar lista:', error)
    return NextResponse.json({ error: 'Erro ao atualizar lista' }, { status: 500 })
  }
} 