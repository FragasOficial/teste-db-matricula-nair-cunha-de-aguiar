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

    console.log(`📊 Total de registros no JSON: ${arr.length}`);

    // Limpar coleção existente
    await Student.deleteMany({});
    console.log('🗑️  Coleção anterior limpa');

    // Mapear os campos do seu JSON
    const mapped = arr.map(i => {
      // Log para debug - ver o primeiro item
      if (!i['Nome do Aluno'] && !i['Home do Aluno']) {
        console.log('Item sem nome:', i);
      }

      return {
        nome: i['Nome do Aluno'] || i['Home do Aluno'] || '', // Campo corrigido
        dataNascimento: i['Data de Nasc.'] ? new Date(i['Data de Nasc.']) : null,
        cpf: (i['CPF'] || '').toString().replace(/\D/g, '').padStart(11, '0'),
        cartaoSUS: (i['Cartão do SUS'] || '').toString().replace(/\s/g, ''),
        nomeMae: i['Nome Mae'] || i['Nome Mãe'] || '',
        nomePai: i['Nome Pai'] || '',
        serieAno: i['Série/Ano'] || '',
        turma: i['Turma'] || '',
        turno: i['Turno'] || '',
        status: i['Status'] || '',
        transporte: i['Transporte'] || '',
        localidade: i['Localidade'] || ''
      };
    });

    console.log('📦 Mapeados', mapped.length, 'registros');
    console.log('📝 Primeiro registro:', mapped[0]);

    const BATCH = 100;
    let totalInseridos = 0;

    for (let i = 0; i < mapped.length; i += BATCH) {
      const batch = mapped.slice(i, i + BATCH);
      try {
        const result = await Student.insertMany(batch, { ordered: false });
        totalInseridos += result.length;
        console.log(`✔ Lote ${Math.floor(i/BATCH) + 1}: ${result.length} registros inseridos`);
      } catch (batchError) {
        console.log(`⚠️  Erros no lote ${Math.floor(i/BATCH) + 1}, continuando...`);
        // Continua mesmo com erros de duplicação
      }
    }

    console.log(`\n🎉 Importação concluída! Total inserido: ${totalInseridos}`);
    
    // Verificar total no banco
    const totalDB = await Student.countDocuments();
    console.log(`📊 Total no banco de dados: ${totalDB}`);

    mongoose.disconnect();
    process.exit(0);

  } catch (err) {
    console.error('❌ Erro na importação:', err.message);
    console.error(err.stack);
    mongoose.disconnect();
    process.exit(1);
  }
}

main();