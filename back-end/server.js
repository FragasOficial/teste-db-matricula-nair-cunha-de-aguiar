// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

// Rotas
const studentRoutes = require('./routes/students');

const app = express();

// ----------------------
// Middlewares Globais
// ----------------------
app.use(cors());
app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// ----------------------
// Rotas da API
// ----------------------
app.use('/students', studentRoutes);

// Rota inicial opcional
app.get('/', (req, res) => {
  res.json({
    message: 'API de Alunos funcionando corretamente ✔️',
    version: '1.0.0',
    endpoints: {
      listar: '/students',
      buscar: '/students/:id',
      criar: '/students',
      atualizar: '/students/:id',
      deletar: '/students/:id'
    }
  });
});

// ----------------------
// Tratamento de Erros 404
// ----------------------
app.use((req, res) => {
  res.status(404).json({ message: 'Rota não encontrada' });
});

// ----------------------
// Middleware GLOBAL de Erros
// ----------------------
app.use((err, req, res, next) => {
  console.error('Erro global:', err);
  res.status(500).json({ error: 'Erro interno no servidor' });
});

// ----------------------
// Conexão com o MongoDB
// ----------------------
const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI;

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('✔ Conectado ao MongoDB com sucesso!');
    console.log('📡 Iniciando servidor...\n');

    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando em: http://localhost:${PORT}`);
      console.log(`📁 Rotas disponíveis: http://localhost:${PORT}/`);
    });
  })
  .catch((err) => {
    console.error('❌ Erro ao conectar ao MongoDB:', err.message);
    process.exit(1);
  });
