// import.js
require('dotenv').config();
const fs = require('fs');
const mongoose = require('mongoose');
const Student = require('./models/Student');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/studentdb';
const JSON_PATH = process.env.JSON_PATH || './Dados_Alunos_NCA_2025_teste.json';

async function main() {
  await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Conectado ao MongoDB');

  const raw = fs.readFileSync(JSON_PATH, 'utf8');
  let arr = JSON.parse(raw);

  // Mapeia e limpa cada objeto do JSON original para o schema
  arr = arr.filter(item => item && (item["Nome do Aluno"] || item["CPF"])); // filtra vazios
  const mapped = arr.map(i => ({
    nome: i["Nome do Aluno"] || '',
    dataNascimento: i["Data de Nasc."] ? new Date(i["Data de Nasc."]) : null,
    cpf: (i["CPF"] || '').toString().replace(/\s/g, ''),
    cartaoSUS: (i["Cartão do SUS"] || '').toString(),
    nomeMae: i["Nome Mãe"] || '',
    nomePai: i["Nome Pai"] || '',
    serieAno: i["Série/Ano"] || '',
    turma: i["Turma"] || '',
    turno: i["Turno"] || '',
    status: i["Status"] || '',
    transporte: i["Transporte"] || '',
    localidade: i["Localidade"] || ''
  }));

  // opcional: limpa colecao antes de importar
  // await Student.deleteMany({});
  // inserir em batches
  const BATCH = 500;
  for (let i = 0; i < mapped.length; i += BATCH) {
    const batch = mapped.slice(i, i + BATCH);
    await Student.insertMany(batch);
    console.log(`Inseridos ${i + batch.length} / ${mapped.length}`);
  }

  console.log('Importação concluída');
  mongoose.disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
