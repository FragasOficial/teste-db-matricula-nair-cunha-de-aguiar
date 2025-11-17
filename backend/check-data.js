require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('./models/Student');

const MONGODB_URI = process.env.MONGODB_URI;

async function checkData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado ao MongoDB');

    // Verificar estrutura real dos primeiros 5 alunos
    const sampleStudents = await Student.find().limit(5);
    
    console.log('\n🔍 ESTRUTURA REAL DOS DADOS:');
    sampleStudents.forEach((student, index) => {
      console.log(`\n--- Aluno ${index + 1} ---`);
      console.log('Todos os campos:', Object.keys(student._doc));
      console.log('Nome:', student.nome);
      console.log('Data Nascimento:', student.dataNascimento);
      console.log('CPF:', student.cpf);
      console.log('Localidade:', student.localidade);
      
      // Verificar campos originais
      console.log('Home do Aluno:', student['Home do Aluno']);
      console.log('Data de Mace.:', student['Data de Mace.']);
    });

    // Verificar tipos de dados
    const withDataNasc = await Student.find({ dataNascimento: { $ne: null } });
    console.log(`\n📊 Alunos com dataNascimento não nula: ${withDataNasc.length}`);

    // Verificar se datas são válidas
    const validDates = await Student.find({ 
      dataNascimento: { 
        $ne: null, 
        $type: 'date' 
      } 
    });
    console.log(`📊 Datas válidas (tipo Date): ${validDates.length}`);

    mongoose.disconnect();

  } catch (err) {
    console.error('❌ Erro:', err);
    mongoose.disconnect();
    process.exit(1);
  }
}

checkData();