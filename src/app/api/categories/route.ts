import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    })
    return NextResponse.json(categories)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar categorias' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json()
    if (!name) return NextResponse.json({ error: 'Nome obrigatório' }, { status: 400 })
    const category = await prisma.category.create({ data: { name } })
    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar categoria' }, { status: 500 })
  }
} 