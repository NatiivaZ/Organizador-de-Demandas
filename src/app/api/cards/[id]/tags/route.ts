import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PUT - Atualizar apenas as tags do cartão (otimizado)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params
    const cardId = parseInt(paramId)
    const { tagIds } = await request.json()

    if (!Array.isArray(tagIds)) {
      return NextResponse.json(
        { error: 'tagIds deve ser um array' },
        { status: 400 }
      )
    }

    // Transação otimizada para atualizar apenas as tags
    await prisma.$transaction(async (tx) => {
      // Remove todas as tags atuais do cartão
      await tx.cardTag.deleteMany({ 
        where: { cardId } 
      })
      
      // Adiciona as novas tags se houver
      if (tagIds.length > 0) {
        await tx.cardTag.createMany({ 
          data: tagIds.map((tagId: number) => ({ cardId, tagId }))
        })
      }
    })

    // Retorna apenas as tags atualizadas para economia de dados
    const updatedTags = await prisma.cardTag.findMany({
      where: { cardId },
      include: { tag: true }
    })

    return NextResponse.json({ 
      success: true, 
      tags: updatedTags 
    })
    
  } catch (error) {
    console.error('Erro ao atualizar tags do cartão:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 