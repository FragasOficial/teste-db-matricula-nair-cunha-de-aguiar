import React from 'react';

const BoletimModal = ({ aluno, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>📊 Boletim - {aluno.nome}</h2>
        <p>Funcionalidade de boletim em desenvolvimento...</p>
        <button onClick={onClose}>Fechar</button>
      </div>
    </div>
  );
};

export default BoletimModal;