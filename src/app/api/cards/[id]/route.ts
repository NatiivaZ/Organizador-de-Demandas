import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PUT - Atualizar cartão
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params
    const id = parseInt(paramId)
    const { listId, title, description, date, categoryId, topics, tagIds, userId, userRole } = await request.json()

    if (!title) {
      return NextResponse.json(
        { error: 'Título é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se o usuário pode editar este cartão
    const existingCard = await prisma.card.findUnique({
      where: { id },
      select: { userId: true }
    })

    if (!existingCard) {
      return NextResponse.json(
        { error: 'Cartão não encontrado' },
        { status: 404 }
      )
    }

    // Só permite edição se for o dono do cartão ou admin/moderator
    if (existingCard.userId !== userId && userRole !== 'ADMIN' && userRole !== 'MODERATOR') {
      return NextResponse.json(
        { error: 'Sem permissão para editar este cartão' },
        { status: 403 }
      )
    }

    // Atualiza cartão
    const card = await prisma.card.update({
      where: { id },
      data: {
        listId,
        title,
        description,
        date,
        categoryId
      },
      include: {
        list: true,
        user: {
          select: {
            id: true,
            username: true
          }
        },
        category: true
      }
    })

    // Atualiza tópicos (remove todos e adiciona novos)
    if (topics) {
      await prisma.topic.deleteMany({ where: { cardId: id } })
      await prisma.topic.createMany({ data: topics.map((t: string) => ({ title: t, cardId: id })) })
    }

    // Atualiza tags (remove todas e adiciona novas)
    if (tagIds !== undefined && Array.isArray(tagIds)) {
      await prisma.cardTag.deleteMany({ where: { cardId: id } })
      if (tagIds.length > 0) {
        await prisma.cardTag.createMany({ data: tagIds.map((tagId: number) => ({ cardId: id, tagId })) })
      }
    }

    // Retorna cartão atualizado
    const updated = await prisma.card.findUnique({
      where: { id },
      include: {
        list: true,
        user: { select: { id: true, username: true } },
        category: true,
        topics: true,
        tags: { include: { tag: true } }
      }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Erro ao atualizar cartão:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Deletar cartão
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params
    const id = parseInt(paramId)
    
    // Obter dados do usuário do body da requisição
    const { userId, userRole } = await request.json()

    // Verificar se o usuário pode deletar este cartão
    const existingCard = await prisma.card.findUnique({
      where: { id },
      select: { userId: true }
    })

    if (!existingCard) {
      return NextResponse.json(
        { error: 'Cartão não encontrado' },
        { status: 404 }
      )
    }

    // Só permite deleção se for o dono do cartão ou admin/moderator
    if (existingCard.userId !== userId && userRole !== 'ADMIN' && userRole !== 'MODERATOR') {
      return NextResponse.json(
        { error: 'Sem permissão para deletar este cartão' },
        { status: 403 }
      )
    }

    await prisma.card.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Cartão deletado com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar cartão:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 