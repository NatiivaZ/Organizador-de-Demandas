import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PUT - Atualizar tag
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params
    const id = parseInt(paramId)
    const { name, color, importance } = await request.json()

    if (!name) {
      return NextResponse.json(
        { error: 'Nome da tag é obrigatório' },
        { status: 400 }
      )
    }

    const tag = await prisma.tag.update({
      where: { id },
      data: {
        name,
        color,
        importance
      }
    })

    return NextResponse.json(tag)
  } catch (error) {
    console.error('Erro ao atualizar tag:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Deletar tag
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params
    const id = parseInt(paramId)

    await prisma.tag.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Tag deletada com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar tag:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 