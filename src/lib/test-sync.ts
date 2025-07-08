// Script de teste para verificar a sincronização de usuários

export function testUserSync() {
  // Simular eventos de criação, atualização e exclusão
  console.log('Testando sincronização de usuários...')
  
  // Testar criação
  const newUser = { id: 999, username: 'teste', role: 'USER', accessLevel: 1 }
  window.dispatchEvent(new CustomEvent('userCreated', { detail: newUser }))
  
  // Testar atualização
  const updatedUser = { id: 999, username: 'teste', role: 'ADMIN', accessLevel: 3 }
  window.dispatchEvent(new CustomEvent('userUpdated', { detail: updatedUser }))
  
  // Testar exclusão
  window.dispatchEvent(new CustomEvent('userDeleted', { detail: { userId: 999 } }))
  
  console.log('Eventos de teste disparados!')
} 