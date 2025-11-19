const mongoose = require('mongoose');

const NotaSchema = new mongoose.Schema({
  id: { type: String, required: true },
  nome: { type: String, trim: true, required: true },
  serie: { type: String, trim: true, required: true },
  bimestre1: { type: Number, min: 0, max: 10, default: 0 },
  bimestre2: { type: Number, min: 0, max: 10, default: 0 },
  bimestre3: { type: Number, min: 0, max: 10, default: 0 },
  bimestre4: { type: Number, min: 0, max: 10, default: 0 },
  mediaFinal: { type: Number, min: 0, max: 10, default: 0 },
  situacao: { 
    type: String, 
    enum: ['Aprovado', 'Reprovado', 'Em Recuperação'],
    default: 'Em Recuperação'
  }
});

const HistoricoSchema = new mongoose.Schema({
  anoLetivo: { type: String, required: true },
  serie: { type: String, required: true },
  turma: { type: String, required: true },
  turno: { type: String, required: true },
  escola: { type: String, default: 'E.E.F. NAIR CUNHA DE AGUIAR' },
  dataConclusao: { type: Date },
  disciplinas: [NotaSchema],
  mediaGeral: { type: Number, min: 0, max: 10, default: 0 },
  situacaoGeral: { 
    type: String, 
    enum: ['Aprovado', 'Reprovado', 'Em Recuperação'],
    default: 'Em Recuperação'
  },
  frequencia: { type: String, default: '' },
  observacoes: { type: String, default: '' }
}, { timestamps: true });

const StudentSchema = new mongoose.Schema({
  // Campos principais
  nome: { type: String, trim: true },
  dataNascimento: { type: Date },
  cpf: { type: String, trim: true },
  cartaoSUS: { type: String, trim: true },
  nomeMae: { type: String, trim: true },
  nomePai: { type: String, trim: true },
  serieAno: { type: String, trim: true },
  turma: { type: String, trim: true },
  turno: { type: String, trim: true },
  status: { 
    type: String, 
    trim: true,
    enum: ['Matriculado', 'Transferido', 'Concluído'],
    default: 'Matriculado'
  },
  transporte: { type: String, trim: true },
  localidade: { type: String, trim: true },
  
  // Notas e disciplinas por série
  notas: [NotaSchema],
  
  // Histórico escolar
  historico: [HistoricoSchema],
  
  // Campos originais para compatibilidade
  "Nome do Aluno": { type: String, trim: true },
  "Data de Nasc.": { type: Date },
  "Cartão do SUS": { type: String, trim: true },
  "Série/Ano": { type: String, trim: true },
  "Turma": { type: String, trim: true },
  "Turno": { type: String, trim: true },
  "Status": { type: String, trim: true },
  "Transporte": { type: String, trim: true },
  "Localidade": { type: String, trim: true }

}, { 
  timestamps: true,
  strict: false
});

module.exports = mongoose.model('Student', StudentSchema);