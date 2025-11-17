// api.js - VERSÃO CORRIGIDA
const API = '/api';

export async function fetchStudents({ page = 1, limit = 50, q = '' } = {}) {
  try {
    const url = new URL(`${API}/students`, window.location.origin);
    url.searchParams.set('page', page);
    url.searchParams.set('limit', limit);
    if (q) url.searchParams.set('q', q);
    
    console.log('🔍 Buscando:', url.toString());
    const res = await fetch(url);
    
    if (!res.ok) throw new Error(`Erro: ${res.status}`);
    
    const data = await res.json();
    console.log('✅ Dados recebidos:', data);
    return data;
  } catch (error) {
    console.error('❌ Erro:', error);
    throw error;
  }
}

export async function getStudent(id) {
  try {
    const res = await fetch(`${API}/students/${id}`);
    if (!res.ok) throw new Error(`Erro ${res.status}: ${await res.text()}`);
    return res.json();
  } catch (error) {
    console.error('❌ Erro ao buscar aluno:', error);
    throw error;
  }
}

// 🔥 CORREÇÃO: Função createStudent corrigida
export async function createStudent(body) {
  try {
    console.log('➕ Criando aluno:', body);
    
    const res = await fetch(`${API}/students`, { 
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json',
      }, 
      body: JSON.stringify(body) 
    });
    
    console.log('📨 Resposta do servidor:', res.status, res.statusText);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('❌ Erro do servidor:', errorText);
      throw new Error(`Erro ${res.status}: ${errorText || 'Erro ao criar aluno'}`);
    }
    
    const data = await res.json();
    console.log('✅ Aluno criado com sucesso:', data);
    return data;
    
  } catch (error) {
    console.error('❌ Erro na função createStudent:', error);
    throw error;
  }
}

export async function updateStudent(id, body) {
  try {
    const res = await fetch(`${API}/students/${id}`, { 
      method: 'PUT', 
      headers: {'Content-Type': 'application/json'}, 
      body: JSON.stringify(body) 
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

export async function deleteStudent(id) {
  try {
    const res = await fetch(`${API}/students/${id}`, { method: 'DELETE' });
    
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