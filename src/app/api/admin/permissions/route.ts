import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Criar ou atualizar permissão específica
export async function POST(request: NextRequest) {
  try {
    const { userId, listId, canView, canEdit, canDelete } = await request.json()
    
    if (!userId || !listId) {
      return NextResponse.json({ error: 'ID do usuário e da lista são obrigatórios' }, { status: 400 })
    }

    const permission = await prisma.listPermission.upsert({
      where: {
        userId_listId: {
          userId,
          listId
        }
      },
      update: {
        canView: canView ?? true,
        canEdit: canEdit ?? false,
        canDelete: canDelete ?? false
      },
      create: {
        userId,
        listId,
        canView: canView ?? true,
        canEdit: canEdit ?? false,
        canDelete: canDelete ?? false
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            role: true,
            accessLevel: true
          }
        },
        list: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json(permission)
  } catch (error) {
    console.error('Erro ao criar/atualizar permissão:', error)
    return NextResponse.json({ error: 'Erro ao criar/atualizar permissão' }, { status: 500 })
  }
}

// DELETE - Remover permissão específica
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const listId = searchParams.get('listId')
    
    if (!userId || !listId) {
      return NextResponse.json({ error: 'ID do usuário e da lista são obrigatórios' }, { status: 400 })
    }

    await prisma.listPermission.delete({
      where: {
        userId_listId: {
          userId: parseInt(userId),
          listId: parseInt(listId)
        }
      }
    })

    return NextResponse.json({ message: 'Permissão removida com sucesso' })
  } catch (error) {
    console.error('Erro ao remover permissão:', error)
    return NextResponse.json({ error: 'Erro ao remover permissão' }, { status: 500 })
  }
} 