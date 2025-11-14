// import.js
require('dotenv').config();
const fs = require('fs');
const mongoose = require('mongoose');
const Student = require('./models/Student');

const MONGODB_URI = process.env.MONGODB_URI;
const JSON_PATH = process.env.JSON_PATH;

async function main() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('✔ Conectado ao MongoDB');

    if (!fs.existsSync(JSON_PATH)) {
      throw new Error(`Arquivo JSON não encontrado: ${JSON_PATH}`);
    }

    const raw = fs.readFileSync(JSON_PATH, 'utf8');
    let arr = JSON.parse(raw);

    // Remove entradas inválidas
    arr = arr.filter(item => item && (item["Nome do Aluno"] || item["CPF"]));

    const mapped = arr.map(i => ({
      nome: i["Nome do Aluno"]?.trim() || '',
      dataNascimento: i["Data de Nasc."] ? new Date(i["Data de Nasc."]) : null,
      cpf: (i["CPF"] || '').toString().replace(/\D/g, ''), // só números
      cartaoSUS: (i["Cartão do SUS"] || '').toString().replace(/\s/g, ''),
      nomeMae: i["Nome Mãe"] || '',
      nomePai: i["Nome Pai"] || '',
      serieAno: i["Série/Ano"] || '',
      turma: i["Turma"] || '',
      turno: i["Turno"] || '',
      status: i["Status"] || '',
      transporte: i["Transporte"] || '',
      localidade: i["Localidade"] || ''
    }));

    const BATCH = 500;
    console.log(`📦 Importando ${mapped.length} registros...\n`);

    for (let i = 0; i < mapped.length; i += BATCH) {
      const batch = mapped.slice(i, i + BATCH);
      await Student.insertMany(batch, { ordered: false });
      console.log(`✔ Inseridos ${Math.min(i + BATCH, mapped.length)} registros`);
    }

    console.log('\n🎉 Importação concluída com sucesso!');
    mongoose.disconnect();

  } catch (err) {
    console.error('❌ Erro na importação:', err.message);
    mongoose.disconnect();
    process.exit(1);
  }
}

main();
