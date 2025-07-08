import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Buscar todas as listas com seus cartões (com filtro de acesso)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const userAccessLevel = searchParams.get('userAccessLevel')
    
    // Se não tiver parâmetros de usuário, retorna todas as listas (para compatibilidade)
    if (!userId || !userAccessLevel) {
      const lists = await prisma.list.findMany({
        include: {
          cards: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true
                }
              },
              category: true,
              topics: true,
              tags: {
                include: {
                  tag: true
                }
              }
            },
            orderBy: {
              createdAt: 'desc'
            }
          }
        },
        orderBy: {
          id: 'asc'
        }
      })
      return NextResponse.json(lists)
    }

    // Buscar listas que o usuário pode ver
    const lists = await prisma.list.findMany({
      where: {
        OR: [
          // Listas públicas com nível de acesso suficiente
          {
            isPublic: true,
            requiredAccessLevel: { lte: parseInt(userAccessLevel) }
          },
          // Listas com permissão específica
          {
            permissions: {
              some: {
                userId: parseInt(userId),
                canView: true
              }
            }
          }
        ]
      },
      include: {
        cards: {
          include: {
            user: {
              select: {
                id: true,
                username: true
              }
            },
            category: true,
            topics: true,
            tags: {
              include: {
                tag: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: {
        id: 'asc'
      }
    })
    return NextResponse.json(lists)
  } catch (error) {
    console.error('Erro ao buscar listas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar nova lista
export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json()

    if (!name) {
      return NextResponse.json(
        { error: 'Nome da lista é obrigatório' },
        { status: 400 }
      )
    }

    const list = await prisma.list.create({
      data: { name },
      include: {
        cards: true
      }
    })

    return NextResponse.json(list, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar lista:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PATCH - Atualizar ordem das listas
export async function PATCH(request: NextRequest) {
  try {
    const { orders } = await request.json() // [{id, order}]
    if (!Array.isArray(orders)) return NextResponse.json({ error: 'Formato inválido' }, { status: 400 })
    for (const { id, order } of orders) {
      await prisma.list.update({ where: { id }, data: { order } })
    }
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar ordem das listas' }, { status: 500 })
  }
} 