require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('./models/Student');

const MONGODB_URI = process.env.MONGODB_URI;

async function addNewFields() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado ao MongoDB');

    // Atualizar todos os alunos para ter os novos campos
    const result = await Student.updateMany(
      { 
        $or: [
          { nomeMae: { $exists: false } },
          { nomePai: { $exists: false } },
          { status: { $exists: false } }
        ]
      },
      { 
        $set: { 
          nomeMae: '',
          nomePai: '',
          status: 'Matriculado',
          notas: []
        }
      }
    );

    console.log(`✅ Campos adicionados: ${result.modifiedCount} alunos atualizados`);
    mongoose.disconnect();
    
  } catch (err) {
    console.error('❌ Erro:', err);
    mongoose.disconnect();
    process.exit(1);
  }
}

addNewFields();