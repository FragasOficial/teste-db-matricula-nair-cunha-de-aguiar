// src/api.js - VERSÃO COMPLETA E CORRIGIDA
const API = '/api';

// 🔥 FUNÇÃO PRINCIPAL PARA BUSCAR ALUNOS
export async function fetchStudents({ page = 1, limit = 50, q = '' } = {}) {
  try {
    const url = new URL(`${API}/students`, window.location.origin);
    url.searchParams.set('page', page);
    url.searchParams.set('limit', limit);
    if (q) url.searchParams.set('q', q);
    
    console.log('🔍 Buscando alunos:', url.toString());
    const res = await fetch(url);
    
    if (!res.ok) throw new Error(`Erro HTTP: ${res.status}`);
    
    const data = await res.json();
    console.log('✅ Dados recebidos:', data.data.length, 'alunos');
    return data;
  } catch (error) {
    console.error('❌ Erro ao buscar alunos:', error);
    throw error;
  }
}

// 🔥 FUNÇÃO PARA CRIAR ALUNO - CORRIGIDA
export async function createStudent(studentData) {
  try {
    console.log('📤 Enviando dados para criar aluno:', studentData);
    
    const res = await fetch(`${API}/students`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nome: studentData.nome || '',
        dataNascimento: studentData.dataNascimento || null,
        cpf: studentData.cpf || '',
        cartaoSUS: studentData.cartaoSUS || '',
        nomeMae: studentData.nomeMae || '',
        nomePai: studentData.nomePai || '',
        serieAno: studentData.serieAno || '',
        turma: studentData.turma || '',
        turno: studentData.turno || '',
        status: studentData.status || 'Matriculado',
        transporte: studentData.transporte || '',
        localidade: studentData.localidade || ''
      })
    });
    
    console.log('📥 Resposta do servidor - Status:', res.status);
    
    const data = await res.json();
    console.log('📋 Dados da resposta:', data);
    
    if (!res.ok) {
      throw new Error(data.error || `Erro ${res.status}: Falha ao criar aluno`);
    }
    
    return data;
  } catch (error) {
    console.error('❌ Erro ao criar aluno:', error);
    throw error;
  }
}

// 🔥 FUNÇÃO PARA BUSCAR ALUNO POR ID
export async function getStudent(id) {
  try {
    console.log(`🔍 Buscando aluno ID: ${id}`);
    const res = await fetch(`${API}/students/${id}`);
    
    if (!res.ok) {
      throw new Error(`Erro ${res.status}: ${await res.text()}`);
    }
    
    return res.json();
  } catch (error) {
    console.error('❌ Erro ao buscar aluno:', error);
    throw error;
  }
}

// 🔥 FUNÇÃO PARA ATUALIZAR ALUNO
export async function updateStudent(id, studentData) {
  try {
    console.log(`✏️ Atualizando aluno ID: ${id}`, studentData);
    
    const res = await fetch(`${API}/students/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(studentData)
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Erro ${res.status}: ${errorText || 'Erro ao atualizar aluno'}`);
    }
    
    return res.json();
  } catch (error) {
    console.error('❌ Erro ao atualizar aluno:', error);
    throw error;
  }
}

// 🔥 FUNÇÃO PARA EXCLUIR ALUNO
export async function deleteStudent(id) {
  try {
    console.log(`🗑️ Excluindo aluno ID: ${id}`);
    
    const res = await fetch(`${API}/students/${id}`, {
      method: 'DELETE'
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Erro ${res.status}: ${errorText || 'Erro ao excluir aluno'}`);
    }
    
    return res.json();
  } catch (error) {
    console.error('❌ Erro ao excluir aluno:', error);
    throw error;
  }
}

// 🔥 FUNÇÕES PARA HISTÓRICO
export async function getHistoricoAluno(id) {
  try {
    console.log(`📚 Buscando histórico do aluno ID: ${id}`);
    const res = await fetch(`${API}/students/${id}/historico`);
    
    if (!res.ok) {
      throw new Error(`Erro ${res.status}: ${await res.text()}`);
    }
    
    return res.json();
  } catch (error) {
    console.error('❌ Erro ao buscar histórico:', error);
    throw error;
  }
}

export async function addHistoricoAluno(id, historicoData) {
  try {
    console.log(`➕ Adicionando histórico ao aluno ID: ${id}`, historicoData);
    
    const res = await fetch(`${API}/students/${id}/historico`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(historicoData)
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Erro ${res.status}: ${errorText || 'Erro ao adicionar histórico'}`);
    }
    
    return res.json();
  } catch (error) {
    console.error('❌ Erro ao adicionar histórico:', error);
    throw error;
  }
}

export async function deleteHistoricoAluno(id, historicoId) {
  try {
    console.log(`🗑️ Excluindo histórico ID: ${historicoId} do aluno ID: ${id}`);
    
    const res = await fetch(`${API}/students/${id}/historico/${historicoId}`, {
      method: 'DELETE'
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Erro ${res.status}: ${errorText || 'Erro ao excluir histórico'}`);
    }
    
    return res.json();
  } catch (error) {
    console.error('❌ Erro ao excluir histórico:', error);
    throw error;
  }
}