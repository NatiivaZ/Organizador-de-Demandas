import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PUT - Atualizar lista
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { name } = await request.json()
    const { id: paramId } = await params
    const id = parseInt(paramId)

    if (!name) {
      return NextResponse.json(
        { error: 'Nome da lista é obrigatório' },
        { status: 400 }
      )
    }

    const list = await prisma.list.update({
      where: { id },
      data: { name },
      include: {
        cards: true
      }
    })

    return NextResponse.json(list)
  } catch (error) {
    console.error('Erro ao atualizar lista:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Deletar lista
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params
    const id = parseInt(paramId)

    console.log('Iniciando exclusão da lista:', id)

    // Verificar se a lista existe
    const existingList = await prisma.list.findUnique({
      where: { id },
      include: { cards: true }
    })

    if (!existingList) {
      console.log('Lista não encontrada:', id)
      return NextResponse.json(
        { error: 'Lista não encontrada' },
        { status: 404 }
      )
    }

    console.log('Lista encontrada:', existingList.name, 'com', existingList.cards.length, 'cartões')

    // Deletar a lista (os cartões serão deletados automaticamente devido ao onDelete: Cascade)
    await prisma.list.delete({
      where: { id }
    })

    console.log('Lista deletada com sucesso:', id)

    return NextResponse.json({ 
      message: 'Lista deletada com sucesso',
      deletedList: existingList.name,
      deletedCards: existingList.cards.length
    })
  } catch (error) {
    console.error('Erro detalhado ao deletar lista:', error)
    return NextResponse.json(
      { error: `Erro interno do servidor: ${error instanceof Error ? error.message : 'Erro desconhecido'}` },
      { status: 500 }
    )
  }
} 