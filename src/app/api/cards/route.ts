import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Buscar todos os cartões
export async function GET() {
  try {
    const cards = await prisma.card.findMany({
      include: {
        list: true,
        user: { select: { id: true, username: true } },
        category: true,
        topics: true,
        tags: { include: { tag: true } }
      },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(cards)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar cartões' }, { status: 500 })
  }
}

// POST - Criar novo cartão
export async function POST(request: NextRequest) {
  try {
    const { listId, title, description, date, userId, categoryId, topics, tagIds } = await request.json()
    if (!listId || !title || !userId) {
      return NextResponse.json({ error: 'Lista, título e usuário são obrigatórios' }, { status: 400 })
    }
    const card = await prisma.card.create({
      data: {
        listId,
        title,
        description,
        date,
        userId,
        categoryId,
        topics: topics && topics.length > 0 ? { create: topics.map((t: string) => ({ title: t })) } : undefined,
        tags: tagIds && tagIds.length > 0 ? { create: tagIds.map((tagId: number) => ({ tagId })) } : undefined
      },
      include: {
        list: true,
        user: { select: { id: true, username: true } },
        category: true,
        topics: true,
        tags: { include: { tag: true } }
      }
    })
    return NextResponse.json(card, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar cartão' }, { status: 500 })
  }
}

// PATCH - Atualizar ordem dos cards
export async function PATCH(request: NextRequest) {
  try {
    const { orders } = await request.json() // [{id, order, listId}]
    if (!Array.isArray(orders)) return NextResponse.json({ error: 'Formato inválido' }, { status: 400 })
    for (const { id, order, listId } of orders) {
      await prisma.card.update({ where: { id }, data: { order, listId } })
    }
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar ordem dos cards' }, { status: 500 })
  }
} 