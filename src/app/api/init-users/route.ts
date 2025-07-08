import { NextResponse } from 'next/server'
import { createTestUsers } from '@/lib/create-test-users'

export async function POST() {
  try {
    const users = await createTestUsers()
    return NextResponse.json({ 
      message: 'Usuários de teste criados/verificados com sucesso!',
      users 
    })
  } catch (error) {
    console.error('Erro ao criar usuários de teste:', error)
    return NextResponse.json(
      { error: 'Erro ao criar usuários de teste' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST para criar usuários de teste'
  })
} 