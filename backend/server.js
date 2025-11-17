require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// CORS para permitir frontend
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

// Rotas
const studentRoutes = require('./routes/students');
app.use('/api/students', studentRoutes);

// Rota de teste
app.get('/api/test', (req, res) => {
  res.json({ 
    message: '✅ Backend funcionando!',
    timestamp: new Date().toISOString()
  });
});

// Conexão MongoDB
const PORT = process.env.PORT || 4000; // FORÇA porta 4000
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/alunos_nca';

console.log('🔧 Configuração:');
console.log('   Porta:', PORT);
console.log('   MongoDB:', MONGODB_URI);

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Conectado ao MongoDB!');
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Backend rodando em: http://localhost:${PORT}`);
      console.log(`🔍 Teste: http://localhost:${PORT}/api/test`);
      console.log(`📊 Alunos: http://localhost:${PORT}/api/students`);
    });
  })
  .catch((err) => {
    console.error('❌ Erro MongoDB:', err.message);
    process.exit(1);
  });