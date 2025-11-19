// test-integration.js
const axios = require('axios');

const API_BASE = 'http://localhost:4000/api';

async function testIntegration() {
  try {
    console.log('🧪 Testando integração com o backend...\n');

    // 1. Testar saúde da API
    console.log('1. Testando saúde da API...');
    const healthResponse = await axios.get(`${API_BASE}/health`);
    console.log('✅ Saúde:', healthResponse.data);

    // 2. Testar listagem
    console.log('\n2. Testando listagem de alunos...');
    const listResponse = await axios.get(`${API_BASE}/students?limit=5`);
    console.log('✅ Listagem:', listResponse.data.data.length, 'alunos retornados');

    // 3. Testar criação de aluno
    console.log('\n3. Testando criação de aluno...');
    const testStudent = {
      nome: 'MARIA SILVA TESTE',
      dataNascimento: '2010-05-15',
      cpf: '12345678901',
      cartaoSUS: '123456789012345',
      serieAno: '5º Ano',
      turma: 'C',
      turno: 'Matutino',
      status: 'Matriculado',
      transporte: 'Não',
      localidade: 'Centro'
    };

    const createResponse = await axios.post(`${API_BASE}/students`, testStudent);
    console.log('✅ Aluno criado:', createResponse.data.data._id);

    // 4. Limpar aluno teste
    console.log('\n4. Limpando aluno teste...');
    await axios.delete(`${API_BASE}/students/${createResponse.data.data._id}`);
    console.log('✅ Aluno teste removido');

    console.log('\n🎉 Todos os testes passaram! O backend está funcionando.');

  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
    
    if (error.response) {
      console.log('📋 Resposta do servidor:', error.response.data);
      console.log('🔧 Status:', error.response.status);
    }
  }
}

testIntegration();