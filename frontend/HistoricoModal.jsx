import React from 'react';

const HistoricoModal = ({ aluno, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>📚 Histórico - {aluno.nome}</h2>
        <p>Funcionalidade de histórico em desenvolvimento...</p>
        <button onClick={onClose}>Fechar</button>
      </div>
    </div>
  );
};

export default HistoricoModal;