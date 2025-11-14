const mongoose = require('mongoose');

// Validação simples de CPF (somente formato, não validade matemática)
const cpfValidator = (cpf) => {
  if (!cpf) return true;
  return /^\d{11}$/.test(cpf); // 11 dígitos
};

const StudentSchema = new mongoose.Schema({
  nome: { type: String, required: true, trim: true },

  dataNascimento: { type: Date },

  cpf: {
    type: String,
    unique: true,
    sparse: true,
    validate: {
      validator: cpfValidator,
      message: 'CPF inválido. Deve conter 11 dígitos numéricos.'
    }
  },

  cartaoSUS: {
    type: String,
    unique: true,
    sparse: true
  },

  nomeMae: { type: String, trim: true },
  nomePai: { type: String, trim: true },

  serieAno: { type: String, trim: true },
  turma: { type: String, trim: true },

  turno: {
    type: String,
    enum: ['Manhã', 'Tarde', 'Noite', 'Integral', 'Outro', ''],
    default: ''
  },

  status: {
    type: String,
    enum: ['Ativo', 'Inativo', 'Transferido', 'Outro', ''],
    default: ''
  },

  transporte: { type: String, trim: true },
  localidade: { type: String, trim: true }

}, { timestamps: true });

module.exports = mongoose.model('Student', StudentSchema);
