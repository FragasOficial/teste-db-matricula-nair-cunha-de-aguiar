import React, { useEffect, useState } from 'react';
import { fetchStudents, getStudent, updateStudent, deleteStudent } from './api';

export default function App() {
  const [students, setStudents] = useState([]);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(false);
  const [total, setTotal] = useState(0);

  async function load() {
    setLoading(true);
    const resp = await fetchStudents({ page, limit, q });
    setStudents(resp.data || []);
    setTotal(resp.total || 0);
    setLoading(false);
  }

  useEffect(()=>{ load(); }, [page, q]);

  async function openDetail(id){
    const s = await getStudent(id);
    setSelected(s);
    setEditing(false);
  }

  async function save(){
    if (!selected || !selected._id) return;
    const res = await updateStudent(selected._id, selected);
    setSelected(res);
    setEditing(false);
    load();
  }

  async function remove(id){
    if (!window.confirm('Excluir aluno?')) return;
    await deleteStudent(id);
    setSelected(null);
    load();
  }

  return (
    <div className="container">
      <header>
        <h1>Alunos NCA</h1>
        <div className="controls">
          <input placeholder="Pesquisar por nome..." value={q} onChange={e=>setQ(e.target.value)} />
          <button onClick={()=>{ setPage(1); load(); }}>Buscar</button>
        </div>
      </header>

      <main>
        <section className="list">
          <div className="meta">
            <div>Total: {total}</div>
            <div>
              Página {page} — <button onClick={()=>setPage(p=>Math.max(1,p-1))}>◀</button>
              <button onClick={()=>setPage(p=>p+1)}>▶</button>
            </div>
          </div>

          {loading ? <div>Carregando...</div> :
            <table>
              <thead>
                <tr>
                  <th>Nome</th><th>Data Nasc.</th><th>CPF</th><th>Série</th><th>Turma</th><th>Localidade</th><th></th>
                </tr>
              </thead>
              <tbody>
                {students.map(s => (
                  <tr key={s._id || s.cpf}>
                    <td>{s.nome}</td>
                    <td>{s.dataNascimento ? new Date(s.dataNascimento).toLocaleDateString() : ''}</td>
                    <td>{s.cpf}</td>
                    <td>{s.serieAno}</td>
                    <td>{s.turma}</td>
                    <td>{s.localidade}</td>
                    <td><button onClick={()=>openDetail(s._id)}>Abrir</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          }
        </section>

        <aside className="detail">
          {selected ? (
            <div>
              <h2>Detalhes</h2>
              {!editing ? (
                <div className="read">
                  <div><strong>Nome:</strong> {selected.nome}</div>
                  <div><strong>CPF:</strong> {selected.cpf}</div>
                  <div><strong>Cartão SUS:</strong> {selected.cartaoSUS}</div>
                  <div><strong>Série/Ano:</strong> {selected.serieAno}</div>
                  <div><strong>Turma:</strong> {selected.turma}</div>
                  <div><strong>Localidade:</strong> {selected.localidade}</div>
                  <div className="actions">
                    <button onClick={()=>setEditing(true)}>Editar</button>
                    <button onClick={()=>remove(selected._id)}>Excluir</button>
                    <button onClick={()=>setSelected(null)}>Fechar</button>
                  </div>
                </div>
              ) : (
                <div className="form">
                  <label>Nome<input value={selected.nome||''} onChange={e=>setSelected({...selected, nome:e.target.value})} /></label>
                  <label>CPF<input value={selected.cpf||''} onChange={e=>setSelected({...selected, cpf:e.target.value})} /></label>
                  <label>Localidade<input value={selected.localidade||''} onChange={e=>setSelected({...selected, localidade:e.target.value})} /></label>
                  <div className="actions">
                    <button onClick={save}>Salvar</button>
                    <button onClick={()=>setEditing(false)}>Cancelar</button>
                  </div>
                </div>
              )}
            </div>
          ) : <div>Selecione um aluno para ver detalhes</div>}
        </aside>
      </main>

      <footer>
        <small>API: http://localhost:4000/api/students</small>
      </footer>
    </div>
  );
}
