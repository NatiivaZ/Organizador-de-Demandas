import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PATCH - Mover cartão para outra lista
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { listId } = await request.json()
    const { id: paramId } = await params
    const cardId = parseInt(paramId)

    if (!listId) {
      return NextResponse.json(
        { error: 'ID da lista de destino é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se a lista de destino existe
    const targetList = await prisma.list.findUnique({
      where: { id: listId }
    })

    if (!targetList) {
      return NextResponse.json(
        { error: 'Lista de destino não encontrada' },
        { status: 404 }
      )
    }

    const card = await prisma.card.update({
      where: { id: cardId },
      data: { listId },
      include: {
        list: true,
        user: {
          select: {
            id: true,
            username: true
          }
        }
      }
    })

    return NextResponse.json(card)
  } catch (error) {
    console.error('Erro ao mover cartão:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 