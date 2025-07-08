import { prisma } from './prisma'

export async function createTestUsers() {
  try {
    // Verificar se já existem usuários
    const existingUsers = await prisma.user.findMany()
    console.log('Usuários existentes:', existingUsers)

    // Criar usuário admin (nível 3 - maior acesso)
    const admin = await prisma.user.upsert({
      where: { username: 'admin' },
      update: {
        role: 'ADMIN',
        accessLevel: 3
      },
      create: {
        username: 'admin',
        password: 'admin123', // Em produção, use hash
        role: 'ADMIN',
        accessLevel: 3
      }
    })

    // Criar usuário moderador (nível 2 - acesso médio)
    const moderator = await prisma.user.upsert({
      where: { username: 'moderador' },
      update: {
        role: 'MODERATOR',
        accessLevel: 2
      },
      create: {
        username: 'moderador',
        password: 'mod123', // Em produção, use hash
        role: 'MODERATOR',
        accessLevel: 2
      }
    })

    // Criar usuário comum (nível 1 - menor acesso)
    const user = await prisma.user.upsert({
      where: { username: 'usuario' },
      update: {
        role: 'USER',
        accessLevel: 1
      },
      create: {
        username: 'usuario',
        password: 'user123', // Em produção, use hash
        role: 'USER',
        accessLevel: 1
      }
    })

    console.log('Usuários criados/verificados:')
    console.log('Admin (ID 1):', admin)
    console.log('Moderador (ID 2):', moderator)
    console.log('Usuário (ID 3):', user)

    return { admin, moderator, user }
  } catch (error) {
    console.error('Erro ao criar usuários de teste:', error)
    throw error
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  createTestUsers()
    .then(() => {
      console.log('Usuários criados com sucesso!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Erro:', error)
      process.exit(1)
    })
} 