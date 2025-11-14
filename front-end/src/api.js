const API = process.env.REACT_APP_API || 'http://localhost:4000/api';
export async function fetchStudents({ page=1, limit=50, q='' } = {}) {
  const url = new URL(`${API}/students`);
  url.searchParams.set('page', page);
  url.searchParams.set('limit', limit);
  if (q) url.searchParams.set('q', q);
  const res = await fetch(url);
  return res.json();
}
export async function getStudent(id){
  const res = await fetch(`${API}/students/${id}`);
  return res.json();
}
export async function updateStudent(id, body){
  const res = await fetch(`${API}/students/${id}`, { method: 'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
  return res.json();
}
export async function deleteStudent(id){
  const res = await fetch(`${API}/students/${id}`, { method: 'DELETE' });
  return res.json();
}
