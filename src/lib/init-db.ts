import { prisma } from './prisma'

const defaultLists = [
  "Preciso de Ajuda Com ...",
  "Entrada",
  "Em Execução",
  "Espera",
  "Transporte",
  "Concluido"
]

export async function initializeDatabase() {
  try {
    // Verificar se já existem listas
    const existingLists = await prisma.list.count()
    
    if (existingLists === 0) {
      // Criar listas padrão
      for (const name of defaultLists) {
        await prisma.list.create({
          data: { name }
        })
      }
      console.log('Listas padrão criadas com sucesso!')
    } else {
      console.log('Banco de dados já inicializado.')
    }
  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error)
  }
} 