import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Buscar todas as listas com seus cartões
export async function GET() {
  try {
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