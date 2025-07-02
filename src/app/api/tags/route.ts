import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const tags = await prisma.tag.findMany({ orderBy: { name: 'asc' } })
    return NextResponse.json(tags)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar etiquetas' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, color, importance } = await request.json()
    if (!name || !color || importance === undefined) return NextResponse.json({ error: 'Nome, cor e importância obrigatórios' }, { status: 400 })
    const tag = await prisma.tag.create({ data: { name, color, importance } })
    return NextResponse.json(tag, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar etiqueta' }, { status: 500 })
  }
} 