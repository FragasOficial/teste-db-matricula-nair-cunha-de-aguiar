require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const studentsRoute = require('./routes/students');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/studentdb';
const PORT = process.env.PORT || 4000;

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(()=>console.log('Mongo conectado'))
  .catch(err => console.error('Erro Mongo:', err));

app.use('/api/students', studentsRoute);

// health
app.get('/api/health', (req,res)=>res.json({ok:true}));

app.listen(PORT, ()=>console.log(`Server rodando na porta ${PORT}`));
