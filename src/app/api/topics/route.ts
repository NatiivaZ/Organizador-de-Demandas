import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const cardId = request.nextUrl.searchParams.get('cardId')
  try {
    const where = cardId ? { cardId: Number(cardId) } : {}
    const topics = await prisma.topic.findMany({ where, orderBy: { id: 'asc' } })
    return NextResponse.json(topics)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar tópicos' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, cardId } = await request.json()
    if (!title || !cardId) return NextResponse.json({ error: 'Título e cardId obrigatórios' }, { status: 400 })
    const topic = await prisma.topic.create({ data: { title, cardId } })
    return NextResponse.json(topic, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar tópico' }, { status: 500 })
  }
} 