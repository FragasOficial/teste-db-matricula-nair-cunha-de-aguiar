// test-backend-connection.js
const axios = require('axios');

async function testBackend() {
  try {
    console.log('🔍 Testando conexão com o backend...\n');
    
    // Testar se o backend está respondendo
    const response = await axios.get('http://localhost:4000/api/health');
    console.log('✅ Backend está respondendo:', response.data);
    
    // Testar criação de aluno
    console.log('\n🧪 Testando criação de aluno...');
    const testData = {
      nome: 'TESTE FRONTEND FIX',
      dataNascimento: '2015-03-20',
      cpf: '99988877766',
      serieAno: '4º Ano',
      turma: 'B',
      turno: 'Matutino',
      status: 'Matriculado',
      transporte: 'Sim',
      localidade: 'Teste'
    };
    
    const createResponse = await axios.post('http://localhost:4000/api/students', testData);
    console.log('✅ Aluno criado com sucesso:', createResponse.data);
    
  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('🔴 Backend não está rodando na porta 4000');
      console.log('💡 Execute: cd backend && npm start');
    }
  }
}

testBackend();