import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PATCH - Mover cartão para outra lista
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { listId, userId, userRole } = await request.json()
    const { id: paramId } = await params
    const cardId = parseInt(paramId)

    if (!listId) {
      return NextResponse.json(
        { error: 'ID da lista de destino é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se o usuário pode mover este cartão
    const existingCard = await prisma.card.findUnique({
      where: { id: cardId },
      select: { userId: true }
    })

    if (!existingCard) {
      return NextResponse.json(
        { error: 'Cartão não encontrado' },
        { status: 404 }
      )
    }

    // Só permite mover se for o dono do cartão ou admin/moderator
    if (existingCard.userId !== userId && userRole !== 'ADMIN' && userRole !== 'MODERATOR') {
      return NextResponse.json(
        { error: 'Sem permissão para mover este cartão' },
        { status: 403 }
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