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
  const res = await fetch(`${API}/students/${id}`);
  if (!res.ok) throw new Error('Erro ao buscar aluno');
  return res.json();
}

export async function createStudent(body) {
  const res = await fetch(`${API}/students`, { 
    method: 'POST', 
    headers: {'Content-Type': 'application/json'}, 
    body: JSON.stringify(body) 
  });
  if (!res.ok) throw new Error('Erro ao criar aluno');
  return res.json();
}

export async function updateStudent(id, body) {
  const res = await fetch(`${API}/students/${id}`, { 
    method: 'PUT', 
    headers: {'Content-Type': 'application/json'}, 
    body: JSON.stringify(body) 
  });
  if (!res.ok) throw new Error('Erro ao atualizar aluno');
  return res.json();
}

export async function deleteStudent(id) {
  const res = await fetch(`${API}/students/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Erro ao excluir aluno');
  return res.json();
}