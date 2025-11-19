// server.js - VERSÃO CORRIGIDA
// server.js - ATUALIZE O CORS
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

// Middlewares
app.use(morgan('combined'));
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://192.168.1.114:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ... resto do código permanece igual
// Log de todas as requisições
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rotas
const studentRoutes = require('./routes/students');
app.use('/api/students', studentRoutes);

// Rota de saúde
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    database: mongoose.connection.readyState === 1 ? 'Conectado' : 'Desconectado',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Rota de teste
app.get('/api/test', (req, res) => {
  res.json({ 
    message: '✅ Backend funcionando!',
    timestamp: new Date().toISOString()
  });
});

// Conexão MongoDB
const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/alunos_nca';

console.log('🔧 Configuração:');
console.log('   Porta:', PORT);
console.log('   MongoDB:', MONGODB_URI);

// Conectar ao MongoDB com opções melhoradas
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Conectado ao MongoDB!');
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Backend rodando em: http://localhost:${PORT}`);
    console.log(`🔍 Health: http://localhost:${PORT}/api/health`);
    console.log(`📊 Alunos: http://localhost:${PORT}/api/students`);
  });
})
.catch((err) => {
  console.error('❌ Erro MongoDB:', err.message);
  process.exit(1);
});

// Tratamento de erros não capturados
process.on('unhandledRejection', (err) => {
  console.error('❌ Erro não tratado:', err);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Exceção não capturada:', err);
  process.exit(1);
});