import React, { useState, useEffect } from 'react';
import './App.css';
import { getLocalData, saveLocalData } from './services/sheetsService';

// ─── Datos iniciales demo ────────────────────────────────────────────────────
const DEMO_GROUPS = [
  { id: 1, nombre: 'Grupo Alpha', proyecto: 'Sistema de Inventario', color: '#ff6b35' },
  { id: 2, nombre: 'Grupo Beta', proyecto: 'App de Delivery', color: '#00d4aa' },
  { id: 3, nombre: 'Grupo Gamma', proyecto: 'Portal Educativo', color: '#7c3aed' },
  { id: 4, nombre: 'Grupo Delta', proyecto: 'E-commerce Platform', color: '#f59e0b' },
  { id: 5, nombre: 'Grupo Epsilon', proyecto: 'Red Social', color: '#ec4899' },
];

const DEMO_STUDENTS = [
  { id: 1, nombre: 'Carlos Mendoza', grupoId: 1, rol: 'Líder' },
  { id: 2, nombre: 'María García', grupoId: 1, rol: 'Dev' },
  { id: 3, nombre: 'Luis Torres', grupoId: 2, rol: 'Líder' },
  { id: 4, nombre: 'Ana Rodríguez', grupoId: 2, rol: 'Dev' },
  { id: 5, nombre: 'Pedro Jiménez', grupoId: 3, rol: 'Líder' },
  { id: 6, nombre: 'Sofia Vargas', grupoId: 3, rol: 'Dev' },
  { id: 7, nombre: 'Diego Castro', grupoId: 4, rol: 'Líder' },
  { id: 8, nombre: 'Valentina Ríos', grupoId: 4, rol: 'Dev' },
  { id: 9, nombre: 'Andrés López', grupoId: 5, rol: 'Líder' },
  { id: 10, nombre: 'Camila Flores', grupoId: 5, rol: 'Dev' },
];

const DEMO_EVENTS = [
  {
    id: 1, titulo: 'Presentación Final', fecha: '2025-06-15', horaInicio: '08:00',
    horaFin: '10:00', grupoId: 1, turno: 1, sala: 'Aula 101', estado: 'confirmado'
  },
  {
    id: 2, titulo: 'Presentación Final', fecha: '2025-06-15', horaInicio: '10:00',
    horaFin: '12:00', grupoId: 2, turno: 2, sala: 'Aula 101', estado: 'confirmado'
  },
  {
    id: 3, titulo: 'Presentación Final', fecha: '2025-06-15', horaInicio: '13:00',
    horaFin: '15:00', grupoId: 3, turno: 3, sala: 'Aula 202', estado: 'pendiente'
  },
  {
    id: 4, titulo: 'Presentación Final', fecha: '2025-06-16', horaInicio: '08:00',
    horaFin: '10:00', grupoId: 4, turno: 1, sala: 'Aula 202', estado: 'confirmado'
  },
  {
    id: 5, titulo: 'Presentación Final', fecha: '2025-06-16', horaInicio: '10:00',
    horaFin: '12:00', grupoId: 5, turno: 2, sala: 'Aula 101', estado: 'pendiente'
  },
];

// ─── Utilidades ──────────────────────────────────────────────────────────────
function formatTime(t) { return t || '--:--'; }
function formatDate(d) {
  if (!d) return '';
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
}
const ESTADOS = { confirmado: '✅', pendiente: '⏳', cancelado: '❌' };

// ─── Componentes UI ──────────────────────────────────────────────────────────
function Badge({ color, children }) {
  return (
    <span className="badge" style={{ background: color + '22', color, border: `1px solid ${color}44` }}>
      {children}
    </span>
  );
}

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Vista: Dashboard ────────────────────────────────────────────────────────
function Dashboard({ events, groups, students }) {
  const today = new Date().toISOString().split('T')[0];
  const upcoming = events.filter(e => e.fecha >= today).slice(0, 3);
  const byGroup = groups.map(g => ({
    ...g,
    events: events.filter(e => e.grupoId === g.id),
    members: students.filter(s => s.grupoId === g.id),
  }));

  return (
    <div className="dashboard">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-val">{groups.length}</div>
          <div className="stat-label">Grupos</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-val">{students.length}</div>
          <div className="stat-label">Estudiantes</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-val">{events.length}</div>
          <div className="stat-label">Eventos</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-val">{events.filter(e => e.estado === 'confirmado').length}</div>
          <div className="stat-label">Confirmados</div>
        </div>
      </div>

      <div className="dash-grid">
        <div className="card">
          <h3 className="card-title">🔜 Próximos Eventos</h3>
          {upcoming.length === 0 ? (
            <p className="empty-state">No hay eventos próximos</p>
          ) : upcoming.map(ev => {
            const grupo = groups.find(g => g.id === ev.grupoId);
            return (
              <div className="event-mini" key={ev.id}>
                <div className="event-mini-dot" style={{ background: grupo?.color || '#888' }} />
                <div>
                  <div className="event-mini-name">{ev.titulo}</div>
                  <div className="event-mini-meta">
                    {formatDate(ev.fecha)} · {formatTime(ev.horaInicio)} · {grupo?.nombre}
                  </div>
                </div>
                <span>{ESTADOS[ev.estado]}</span>
              </div>
            );
          })}
        </div>

        <div className="card">
          <h3 className="card-title">🗂️ Grupos & Turnos</h3>
          {byGroup.map(g => (
            <div className="group-mini" key={g.id}>
              <div className="group-mini-color" style={{ background: g.color }} />
              <div className="group-mini-info">
                <strong>{g.nombre}</strong>
                <span>{g.proyecto}</span>
              </div>
              <div className="group-mini-right">
                <Badge color={g.color}>T{g.events[0]?.turno || '—'}</Badge>
                <span className="members-count">{g.members.length} 👤</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Vista: Horario / Timeline ───────────────────────────────────────────────
function Schedule({ events, groups }) {
  const [filterDate, setFilterDate] = useState('');
  const dates = [...new Set(events.map(e => e.fecha))].sort();
  const filtered = events
    .filter(e => !filterDate || e.fecha === filterDate)
    .sort((a, b) => (a.fecha + a.horaInicio).localeCompare(b.fecha + b.horaInicio));

  const byDate = {};
  filtered.forEach(ev => {
    if (!byDate[ev.fecha]) byDate[ev.fecha] = [];
    byDate[ev.fecha].push(ev);
  });

  return (
    <div className="schedule-view">
      <div className="schedule-toolbar">
        <h2 className="section-title">📅 Horario de Eventos</h2>
        <select className="select-input" value={filterDate} onChange={e => setFilterDate(e.target.value)}>
          <option value="">Todas las fechas</option>
          {dates.map(d => <option key={d} value={d}>{formatDate(d)}</option>)}
        </select>
      </div>

      {Object.keys(byDate).length === 0 ? (
        <div className="empty-card">Sin eventos para mostrar</div>
      ) : Object.entries(byDate).map(([date, dayEvents]) => (
        <div key={date} className="day-block">
          <div className="day-header">{formatDate(date)}</div>
          <div className="timeline">
            {dayEvents.map(ev => {
              const grupo = groups.find(g => g.id === ev.grupoId);
              return (
                <div className="timeline-event" key={ev.id}
                  style={{ borderLeft: `4px solid ${grupo?.color || '#888'}` }}>
                  <div className="tl-time">
                    <span>{formatTime(ev.horaInicio)}</span>
                    <span className="tl-sep">→</span>
                    <span>{formatTime(ev.horaFin)}</span>
                  </div>
                  <div className="tl-content">
                    <div className="tl-title">{ev.titulo}</div>
                    <div className="tl-meta">
                      <Badge color={grupo?.color || '#888'}>{grupo?.nombre || 'N/A'}</Badge>
                      <span className="tl-sala">📍 {ev.sala}</span>
                      <span className="tl-turno">Turno {ev.turno}</span>
                    </div>
                  </div>
                  <div className="tl-estado">{ESTADOS[ev.estado]}</div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Vista: Grupos ───────────────────────────────────────────────────────────
function Groups({ groups, students, events, onAddGroup, onDeleteGroup }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nombre: '', proyecto: '', color: '#7c3aed' });

  const handleSubmit = () => {
    if (!form.nombre || !form.proyecto) return;
    onAddGroup({ ...form, id: Date.now() });
    setForm({ nombre: '', proyecto: '', color: '#7c3aed' });
    setShowForm(false);
  };

  return (
    <div>
      <div className="schedule-toolbar">
        <h2 className="section-title">🗂️ Grupos</h2>
        <button className="btn-primary" onClick={() => setShowForm(true)}>+ Nuevo Grupo</button>
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Agregar Grupo">
        <div className="form-grid">
          <label>Nombre del Grupo
            <input className="form-input" value={form.nombre}
              onChange={e => setForm({ ...form, nombre: e.target.value })}
              placeholder="Ej: Grupo Alpha" />
          </label>
          <label>Nombre del Proyecto
            <input className="form-input" value={form.proyecto}
              onChange={e => setForm({ ...form, proyecto: e.target.value })}
              placeholder="Ej: App de Delivery" />
          </label>
          <label>Color
            <input type="color" className="color-input" value={form.color}
              onChange={e => setForm({ ...form, color: e.target.value })} />
          </label>
        </div>
        <div className="form-actions">
          <button className="btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
          <button className="btn-primary" onClick={handleSubmit}>Guardar</button>
        </div>
      </Modal>

      <div className="groups-grid">
        {groups.map(g => {
          const groupStudents = students.filter(s => s.grupoId === g.id);
          const groupEvents = events.filter(e => e.grupoId === g.id);
          const nextEvent = groupEvents.sort((a, b) => a.fecha.localeCompare(b.fecha))[0];
          return (
            <div className="group-card" key={g.id}
              style={{ borderTop: `4px solid ${g.color}` }}>
              <div className="group-card-header">
                <div>
                  <h3>{g.nombre}</h3>
                  <p className="project-name">{g.proyecto}</p>
                </div>
                <button className="btn-danger-sm" onClick={() => onDeleteGroup(g.id)}>✕</button>
              </div>
              <div className="group-card-body">
                <div className="group-stat">
                  <span>👥 Estudiantes</span>
                  <strong>{groupStudents.length}</strong>
                </div>
                <div className="group-stat">
                  <span>📅 Eventos</span>
                  <strong>{groupEvents.length}</strong>
                </div>
                {nextEvent && (
                  <div className="next-event-mini">
                    <span>Próximo: </span>
                    <Badge color={g.color}>Turno {nextEvent.turno} · {formatDate(nextEvent.fecha)}</Badge>
                  </div>
                )}
              </div>
              <div className="group-members">
                {groupStudents.map(s => (
                  <span key={s.id} className="member-chip"
                    style={{ borderColor: g.color + '66' }}>
                    {s.nombre.split(' ')[0]}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Vista: Estudiantes ──────────────────────────────────────────────────────
function Students({ students, groups, onAddStudent, onDeleteStudent }) {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ nombre: '', grupoId: '', rol: 'Dev' });

  const filtered = students.filter(s =>
    s.nombre.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = () => {
    if (!form.nombre || !form.grupoId) return;
    onAddStudent({ ...form, id: Date.now(), grupoId: Number(form.grupoId) });
    setForm({ nombre: '', grupoId: '', rol: 'Dev' });
    setShowForm(false);
  };

  return (
    <div>
      <div className="schedule-toolbar">
        <h2 className="section-title">👥 Estudiantes</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input className="search-input" placeholder="🔍 Buscar..." value={search}
            onChange={e => setSearch(e.target.value)} />
          <button className="btn-primary" onClick={() => setShowForm(true)}>+ Agregar</button>
        </div>
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Agregar Estudiante">
        <div className="form-grid">
          <label>Nombre completo
            <input className="form-input" value={form.nombre}
              onChange={e => setForm({ ...form, nombre: e.target.value })}
              placeholder="Nombre Apellido" />
          </label>
          <label>Grupo
            <select className="form-input" value={form.grupoId}
              onChange={e => setForm({ ...form, grupoId: e.target.value })}>
              <option value="">Seleccionar grupo...</option>
              {groups.map(g => <option key={g.id} value={g.id}>{g.nombre}</option>)}
            </select>
          </label>
          <label>Rol
            <select className="form-input" value={form.rol}
              onChange={e => setForm({ ...form, rol: e.target.value })}>
              <option>Dev</option>
              <option>Líder</option>
              <option>Diseñador</option>
              <option>QA</option>
            </select>
          </label>
        </div>
        <div className="form-actions">
          <button className="btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
          <button className="btn-primary" onClick={handleSubmit}>Guardar</button>
        </div>
      </Modal>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Nombre</th>
              <th>Grupo</th>
              <th>Proyecto</th>
              <th>Rol</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s, i) => {
              const grupo = groups.find(g => g.id === s.grupoId);
              return (
                <tr key={s.id}>
                  <td>{i + 1}</td>
                  <td><strong>{s.nombre}</strong></td>
                  <td>
                    {grupo && <Badge color={grupo.color}>{grupo.nombre}</Badge>}
                  </td>
                  <td className="muted">{grupo?.proyecto || '—'}</td>
                  <td>{s.rol}</td>
                  <td>
                    <button className="btn-danger-sm" onClick={() => onDeleteStudent(s.id)}>✕</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Vista: Turnos ───────────────────────────────────────────────────────────
function Turns({ events, groups }) {
  const turnosByGroup = groups.map(g => {
    const groupEvents = events
      .filter(e => e.grupoId === g.id)
      .sort((a, b) => a.fecha.localeCompare(b.fecha));
    return { ...g, eventos: groupEvents };
  });

  return (
    <div>
      <h2 className="section-title">🎯 Turnos por Grupo</h2>
      <div className="turns-grid">
        {turnosByGroup.map(g => (
          <div className="turn-card" key={g.id}
            style={{ background: `linear-gradient(135deg, ${g.color}15 0%, transparent 60%)`, borderColor: g.color + '44' }}>
            <div className="turn-card-top" style={{ background: g.color }}>
              <h3>{g.nombre}</h3>
              <span className="turn-project">{g.proyecto}</span>
            </div>
            <div className="turn-events">
              {g.eventos.length === 0 ? (
                <div className="empty-state small">Sin turnos asignados</div>
              ) : g.eventos.map(ev => (
                <div className="turn-event-row" key={ev.id}>
                  <div className="turn-number" style={{ background: g.color }}>T{ev.turno}</div>
                  <div className="turn-event-info">
                    <strong>{ev.titulo}</strong>
                    <span>{formatDate(ev.fecha)} · {formatTime(ev.horaInicio)} – {formatTime(ev.horaFin)}</span>
                    <span>📍 {ev.sala}</span>
                  </div>
                  <div className="turn-estado">{ESTADOS[ev.estado]}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Vista: Eventos ──────────────────────────────────────────────────────────
function Events({ events, groups, onAddEvent, onDeleteEvent, onToggleStatus }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    titulo: '', fecha: '', horaInicio: '', horaFin: '',
    grupoId: '', turno: 1, sala: '', estado: 'pendiente'
  });

  const handleSubmit = () => {
    if (!form.titulo || !form.fecha || !form.grupoId) return;
    onAddEvent({ ...form, id: Date.now(), grupoId: Number(form.grupoId), turno: Number(form.turno) });
    setForm({ titulo: '', fecha: '', horaInicio: '', horaFin: '', grupoId: '', turno: 1, sala: '', estado: 'pendiente' });
    setShowForm(false);
  };

  return (
    <div>
      <div className="schedule-toolbar">
        <h2 className="section-title">📋 Eventos</h2>
        <button className="btn-primary" onClick={() => setShowForm(true)}>+ Nuevo Evento</button>
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Crear Evento">
        <div className="form-grid">
          <label>Título del evento
            <input className="form-input" value={form.titulo}
              onChange={e => setForm({ ...form, titulo: e.target.value })}
              placeholder="Ej: Presentación Final" />
          </label>
          <label>Fecha
            <input type="date" className="form-input" value={form.fecha}
              onChange={e => setForm({ ...form, fecha: e.target.value })} />
          </label>
          <label>Hora inicio
            <input type="time" className="form-input" value={form.horaInicio}
              onChange={e => setForm({ ...form, horaInicio: e.target.value })} />
          </label>
          <label>Hora fin
            <input type="time" className="form-input" value={form.horaFin}
              onChange={e => setForm({ ...form, horaFin: e.target.value })} />
          </label>
          <label>Grupo
            <select className="form-input" value={form.grupoId}
              onChange={e => setForm({ ...form, grupoId: e.target.value })}>
              <option value="">Seleccionar grupo...</option>
              {groups.map(g => <option key={g.id} value={g.id}>{g.nombre}</option>)}
            </select>
          </label>
          <label>Número de Turno
            <input type="number" min="1" className="form-input" value={form.turno}
              onChange={e => setForm({ ...form, turno: e.target.value })} />
          </label>
          <label>Sala / Lugar
            <input className="form-input" value={form.sala}
              onChange={e => setForm({ ...form, sala: e.target.value })}
              placeholder="Ej: Aula 101" />
          </label>
          <label>Estado
            <select className="form-input" value={form.estado}
              onChange={e => setForm({ ...form, estado: e.target.value })}>
              <option value="pendiente">⏳ Pendiente</option>
              <option value="confirmado">✅ Confirmado</option>
              <option value="cancelado">❌ Cancelado</option>
            </select>
          </label>
        </div>
        <div className="form-actions">
          <button className="btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
          <button className="btn-primary" onClick={handleSubmit}>Guardar</button>
        </div>
      </Modal>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Turno</th>
              <th>Título</th>
              <th>Grupo</th>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Sala</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {events.sort((a, b) => a.fecha.localeCompare(b.fecha)).map(ev => {
              const grupo = groups.find(g => g.id === ev.grupoId);
              return (
                <tr key={ev.id}>
                  <td><span className="turno-badge">T{ev.turno}</span></td>
                  <td><strong>{ev.titulo}</strong></td>
                  <td>{grupo && <Badge color={grupo.color}>{grupo.nombre}</Badge>}</td>
                  <td>{formatDate(ev.fecha)}</td>
                  <td className="muted">{formatTime(ev.horaInicio)} – {formatTime(ev.horaFin)}</td>
                  <td className="muted">{ev.sala}</td>
                  <td>
                    <button className="status-btn" onClick={() => onToggleStatus(ev.id)}>
                      {ESTADOS[ev.estado]} {ev.estado}
                    </button>
                  </td>
                  <td>
                    <button className="btn-danger-sm" onClick={() => onDeleteEvent(ev.id)}>✕</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── App principal ───────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState('dashboard');
  const [groups, setGroups] = useState(() => {
    const saved = getLocalData('groups');
    return saved.length > 0 ? saved : DEMO_GROUPS;
  });
  const [students, setStudents] = useState(() => {
    const saved = getLocalData('students');
    return saved.length > 0 ? saved : DEMO_STUDENTS;
  });
  const [events, setEvents] = useState(() => {
    const saved = getLocalData('events');
    return saved.length > 0 ? saved : DEMO_EVENTS;
  });
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => { saveLocalData('groups', groups); }, [groups]);
  useEffect(() => { saveLocalData('students', students); }, [students]);
  useEffect(() => { saveLocalData('events', events); }, [events]);

  const addGroup = g => setGroups(prev => [...prev, g]);
  const deleteGroup = id => {
    setGroups(prev => prev.filter(g => g.id !== id));
    setStudents(prev => prev.filter(s => s.grupoId !== id));
    setEvents(prev => prev.filter(e => e.grupoId !== id));
  };
  const addStudent = s => setStudents(prev => [...prev, s]);
  const deleteStudent = id => setStudents(prev => prev.filter(s => s.id !== id));
  const addEvent = ev => setEvents(prev => [...prev, ev]);
  const deleteEvent = id => setEvents(prev => prev.filter(e => e.id !== id));
  const toggleStatus = id => setEvents(prev => prev.map(e => {
    if (e.id !== id) return e;
    const cycle = { pendiente: 'confirmado', confirmado: 'cancelado', cancelado: 'pendiente' };
    return { ...e, estado: cycle[e.estado] };
  }));

  const TABS = [
    { id: 'dashboard', icon: '🏠', label: 'Inicio' },
    { id: 'schedule', icon: '📅', label: 'Horario' },
    { id: 'turns', icon: '🎯', label: 'Turnos' },
    { id: 'groups', icon: '🗂️', label: 'Grupos' },
    { id: 'students', icon: '👥', label: 'Estudiantes' },
    { id: 'events', icon: '📋', label: 'Eventos' },
  ];

  return (
    <div className="app">
      {/* Sidebar desktop */}
      <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-icon">⚡</div>
          <div>
            <div className="brand-name">EventOS</div>
            <div className="brand-sub">Organizador Académico</div>
          </div>
        </div>
        <nav className="sidebar-nav">
          {TABS.map(t => (
            <button key={t.id}
              className={`nav-item ${tab === t.id ? 'active' : ''}`}
              onClick={() => { setTab(t.id); setMenuOpen(false); }}>
              <span className="nav-icon">{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="sheets-badge">📊 Google Sheets DB</div>
        </div>
      </aside>

      {/* Overlay mobile */}
      {menuOpen && <div className="sidebar-overlay" onClick={() => setMenuOpen(false)} />}

      {/* Main */}
      <main className="main-content">
        <header className="topbar">
          <button className="menu-btn" onClick={() => setMenuOpen(!menuOpen)}>☰</button>
          <h1 className="topbar-title">{TABS.find(t => t.id === tab)?.label}</h1>
          <div className="topbar-right">
            <span className="online-dot" />
            <span className="online-label">Local Storage</span>
          </div>
        </header>

        <div className="content">
          {tab === 'dashboard' && <Dashboard events={events} groups={groups} students={students} />}
          {tab === 'schedule' && <Schedule events={events} groups={groups} />}
          {tab === 'turns' && <Turns events={events} groups={groups} />}
          {tab === 'groups' && <Groups groups={groups} students={students} events={events} onAddGroup={addGroup} onDeleteGroup={deleteGroup} />}
          {tab === 'students' && <Students students={students} groups={groups} onAddStudent={addStudent} onDeleteStudent={deleteStudent} />}
          {tab === 'events' && <Events events={events} groups={groups} onAddEvent={addEvent} onDeleteEvent={deleteEvent} onToggleStatus={toggleStatus} />}
        </div>
      </main>

      {/* Bottom nav mobile */}
      <nav className="bottom-nav">
        {TABS.map(t => (
          <button key={t.id}
            className={`bottom-nav-item ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}>
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
