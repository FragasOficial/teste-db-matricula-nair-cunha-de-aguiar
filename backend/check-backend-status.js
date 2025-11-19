// check-backend-status.js
const mongoose = require('mongoose');
require('dotenv').config();

async function checkBackendStatus() {
  console.log('🔍 Verificando status do backend...\n');
  
  // 1. Verificar conexão MongoDB
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB: Conectado');
    
    const Student = require('./models/Student');
    const count = await Student.countDocuments();
    console.log(`✅ Banco de dados: ${count} alunos encontrados`);
    
    mongoose.disconnect();
  } catch (err) {
    console.log('❌ MongoDB: Erro na conexão', err.message);
  }
  
  // 2. Verificar se a porta 4000 está ocupada
  const net = require('net');
  const tester = net.createServer();
  
  tester.once('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log('✅ Backend: Rodando na porta 4000');
    }
  });
  
  tester.once('listening', () => {
    console.log('❌ Backend: Não está rodando na porta 4000');
    tester.close();
  });
  
  tester.listen(4000);
}

checkBackendStatus();