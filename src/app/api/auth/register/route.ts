import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  // Registro público foi desabilitado por questões de segurança
  // Novos usuários devem ser criados através do painel administrativo
  return NextResponse.json(
    { 
      error: 'Registro público desabilitado. Entre em contato com o administrador do sistema para criar uma nova conta.' 
    },
    { status: 403 }
  )
}

export async function GET() {
  return NextResponse.json(
    { 
      message: 'Registro público desabilitado. Usuários devem ser criados pelo administrador.' 
    },
    { status: 403 }
  )
} 